// ═══════════════════════════════════════════
// CarCues Car Service — CRUD + AI (Gemini API)
// All data via Neon PostgreSQL API
// ═══════════════════════════════════════════

import { analyzeWithVisionAPI } from './visionService';
import { calculateRarityFromDatabase } from './vehicleDataService';
import { api } from './apiClient';
import { getRarityTier, CAR_DATABASE } from '../data/mockData';

const CONFIDENCE_THRESHOLD = 80;

// ──── Car Spots ────
export async function getUserSpots(userId) {
    const data = await api('/api/spots');
    return data.spots;
}

export async function getAllSpots() {
    const data = await api('/api/spots/all');
    return data.spots;
}

export async function addSpot(userId, spot) {
    const data = await api('/api/spots', {
        method: 'POST',
        body: JSON.stringify({
            car: spot.car,
            location: spot.location,
            source: spot.source,
        }),
    });
    return data.spot;
}

export async function removeSpot(userId, spotId) {
    await api(`/api/spots/${spotId}`, { method: 'DELETE' });
}

// ──── AI Car Analysis (Gemini API + Mock Fallback) ────
export async function analyzeCarPhoto(imageFile) {
    try {
        const visionResult = await analyzeWithVisionAPI(imageFile);

        if (visionResult.identified) {
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
            return {
                identified: false,
                error: visionResult.error || 'Could not identify a car in this photo.',
                source: 'gemini',
            };
        }
    } catch (err) {
        console.warn('Gemini API unavailable, using mock analysis:', err.message);

        // Fallback to mock analysis
        const { CAR_DATABASE } = await import('../data/mockData');
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

// ──── Stats ────
export async function getUserStats(userId) {
    const data = await api('/api/stats');
    return data;
}

// ──── Leaderboard ────
export async function getLeaderboard() {
    const data = await api('/api/leaderboard');
    return data.leaderboard;
}

// ──── Search Cars (client-side, uses local car database) ────
export function searchCars(query) {
    const q = query.toLowerCase();
    return CAR_DATABASE.filter(car =>
        car.make.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.category.toLowerCase().includes(q) ||
        car.year.toString().includes(q)
    );
}
