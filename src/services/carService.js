// ═══════════════════════════════════════════
// CarCues Car Service — CRUD + AI (Vision API)
// ═══════════════════════════════════════════

import { CAR_DATABASE, getRarityTier, generateMockSpots } from '../data/mockData';
import { analyzeWithVisionAPI } from './visionService';
import { calculateRarityFromDatabase } from './vehicleDataService';

const STORAGE_KEYS = {
    SPOTS: 'carcues_spots',
    WISHLIST: 'carcues_wishlist',
    USERS: 'carcues_users',
};

// ──── Auto-migrate existing spots to new rarity scale ────
(function migrateRarityScores() {
    const MIGRATION_KEY = 'carcues_rarity_migrated_v2';
    if (localStorage.getItem(MIGRATION_KEY)) return; // Already migrated

    try {
        const raw = localStorage.getItem(STORAGE_KEYS.SPOTS);
        if (!raw) { localStorage.setItem(MIGRATION_KEY, 'true'); return; }

        const allSpots = JSON.parse(raw);
        let changed = false;

        for (const userId of Object.keys(allSpots)) {
            const spots = allSpots[userId];
            if (!Array.isArray(spots)) continue;

            for (const spot of spots) {
                if (!spot.car) continue;
                const newRarity = calculateRarityFromDatabase(
                    spot.car.make, spot.car.model, spot.car.category
                );
                if (spot.car.rarity !== newRarity) {
                    spot.car.rarity = newRarity;
                    changed = true;
                }
            }
        }

        if (changed) {
            localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(allSpots));
            console.log('✅ CarCues: Migrated existing spots to new rarity scoring');
        }
        localStorage.setItem(MIGRATION_KEY, 'true');
    } catch (err) {
        console.warn('CarCues rarity migration failed:', err);
    }
})();

// ──── Storage Helpers ────
function getFromStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ──── Car Spots ────
export function getUserSpots(userId) {
    const allSpots = getFromStorage(STORAGE_KEYS.SPOTS, {});
    if (!allSpots[userId]) {
        // Initialize with mock spots for demo
        allSpots[userId] = generateMockSpots(userId, 8);
        saveToStorage(STORAGE_KEYS.SPOTS, allSpots);
    }
    return allSpots[userId];
}

export function getAllSpots() {
    const allSpots = getFromStorage(STORAGE_KEYS.SPOTS, {});
    return Object.values(allSpots).flat();
}

export function addSpot(userId, spot) {
    const allSpots = getFromStorage(STORAGE_KEYS.SPOTS, {});
    if (!allSpots[userId]) allSpots[userId] = [];
    allSpots[userId].unshift(spot);
    saveToStorage(STORAGE_KEYS.SPOTS, allSpots);
    return spot;
}

export function removeSpot(userId, spotId) {
    const allSpots = getFromStorage(STORAGE_KEYS.SPOTS, {});
    if (allSpots[userId]) {
        allSpots[userId] = allSpots[userId].filter(s => s.id !== spotId);
        saveToStorage(STORAGE_KEYS.SPOTS, allSpots);
    }
}

// ──── Wishlist ────
export function getUserWishlist(userId) {
    const allWishlists = getFromStorage(STORAGE_KEYS.WISHLIST, {});
    return allWishlists[userId] || [];
}

export function addToWishlist(userId, car) {
    const allWishlists = getFromStorage(STORAGE_KEYS.WISHLIST, {});
    if (!allWishlists[userId]) allWishlists[userId] = [];

    if (!allWishlists[userId].find(c => c.id === car.id)) {
        allWishlists[userId].push({ ...car, addedAt: new Date().toISOString() });
        saveToStorage(STORAGE_KEYS.WISHLIST, allWishlists);
    }
    return allWishlists[userId];
}

export function removeFromWishlist(userId, carId) {
    const allWishlists = getFromStorage(STORAGE_KEYS.WISHLIST, {});
    if (allWishlists[userId]) {
        allWishlists[userId] = allWishlists[userId].filter(c => c.id !== carId);
        saveToStorage(STORAGE_KEYS.WISHLIST, allWishlists);
    }
}

export function isOnWishlist(userId, carId) {
    const wishlist = getUserWishlist(userId);
    return wishlist.some(c => c.id === carId);
}

// ──── AI Car Analysis (Google Cloud Vision API + Mock Fallback) ────
export async function analyzeCarPhoto(imageFile) {
    try {
        // Try the real Vision API first
        const visionResult = await analyzeWithVisionAPI(imageFile);

        if (visionResult.identified) {
            // Enrich with rarity tier
            visionResult.rarityTier = getRarityTier(visionResult.car.rarity);
            visionResult.analysisDetails = {
                make: { value: visionResult.car.make, confidence: visionResult.confidence },
                model: { value: visionResult.car.model, confidence: visionResult.confidence },
                year: { value: visionResult.car.year, confidence: Math.max(50, visionResult.confidence - 15) },
                category: { value: visionResult.car.category, confidence: visionResult.confidence },
            };
            visionResult.source = 'gemini';
            return visionResult;
        } else {
            // Gemini didn't detect a car
            return {
                identified: false,
                error: visionResult.error || 'Could not identify a car in this photo.',
                source: 'gemini',
            };
        }
    } catch (err) {
        console.warn('Vision API unavailable, using mock analysis:', err.message);

        // Fallback to mock analysis
        return new Promise((resolve) => {
            const delay = 1500 + Math.random() * 1500;
            setTimeout(() => {
                const car = CAR_DATABASE[Math.floor(Math.random() * CAR_DATABASE.length)];
                const confidence = Math.floor(75 + Math.random() * 20);
                resolve({
                    identified: true,
                    car: { ...car },
                    confidence,
                    rarityTier: getRarityTier(car.rarity),
                    analysisDetails: {
                        make: { value: car.make, confidence: confidence + Math.floor(Math.random() * 5) },
                        model: { value: car.model, confidence },
                        year: { value: car.year, confidence: confidence - Math.floor(Math.random() * 10) },
                        category: { value: car.category, confidence: confidence + Math.floor(Math.random() * 3) },
                    },
                    source: 'mock',
                });
            }, delay);
        });
    }
}

// ──── Stats Calculation ────
export function getUserStats(userId) {
    const spots = getUserSpots(userId);
    const wishlist = getUserWishlist(userId);

    const totalRarityPoints = spots.reduce((sum, spot) => sum + (spot.car?.rarity || 0), 0);
    const rarestFind = spots.length > 0
        ? spots.reduce((rarest, spot) => (spot.car?.rarity || 0) > (rarest.car?.rarity || 0) ? spot : rarest, spots[0])
        : null;

    const uniqueMakes = new Set(spots.map(s => s.car?.make).filter(Boolean));

    return {
        totalSpots: spots.length,
        totalRarityPoints,
        rarestFind,
        wishlistCount: wishlist.length,
        uniqueMakes: uniqueMakes.size,
        averageRarity: spots.length > 0 ? (totalRarityPoints / spots.length).toFixed(1) : 0,
        level: Math.floor(totalRarityPoints / 200) + 1,
        xpProgress: ((totalRarityPoints % 200) / 200) * 100,
    };
}

// ──── Leaderboard ────
export function getLeaderboard() {
    const allSpots = getFromStorage(STORAGE_KEYS.SPOTS, {});
    const users = getFromStorage(STORAGE_KEYS.USERS, []);

    const leaderboard = users.map(user => {
        const spots = allSpots[user.id] || [];
        const totalRarityPoints = spots.reduce((sum, spot) => sum + (spot.car?.rarity || 0), 0);
        const rarestFind = spots.length > 0
            ? spots.reduce((r, s) => (s.car?.rarity || 0) > (r.car?.rarity || 0) ? s : r, spots[0])
            : null;

        return {
            ...user,
            totalSpots: spots.length,
            totalRarityPoints,
            rarestFind,
            level: Math.floor(totalRarityPoints / 20) + 1,
        };
    });

    return leaderboard.sort((a, b) => b.totalRarityPoints - a.totalRarityPoints);
}

// ──── Search Cars ────
export function searchCars(query) {
    const q = query.toLowerCase();
    return CAR_DATABASE.filter(car =>
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.category.toLowerCase().includes(q) ||
        car.year.toString().includes(q)
    );
}
