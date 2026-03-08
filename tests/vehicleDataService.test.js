import { describe, it, expect } from 'vitest';
import {
    calculateRarityFromDatabase,
    getEstimatedMSRP,
    searchFullDatabase,
    getAllCarsForWishlist,
    getCarImage,
} from '../src/services/vehicleDataService.js';

// ═══════════════════════════════════════════
// calculateRarityFromDatabase
// ═══════════════════════════════════════════
describe('calculateRarityFromDatabase', () => {
    it('returns a numeric score >= 1', () => {
        const score = calculateRarityFromDatabase('Toyota', 'Camry', 'Car');
        expect(score).toBeGreaterThanOrEqual(1);
        expect(typeof score).toBe('number');
    });

    it('scores mythic brands (Bugatti) much higher than common brands', () => {
        const bugatti = calculateRarityFromDatabase('Bugatti', 'Chiron', 'Hypercar');
        const toyota = calculateRarityFromDatabase('Toyota', 'Camry', 'Car');
        expect(bugatti).toBeGreaterThan(toyota + 30);
    });

    it('scores hypercars higher than regular cars of the same brand tier', () => {
        const hypercar = calculateRarityFromDatabase('Ferrari', 'LaFerrari', 'Hypercar');
        const sportscar = calculateRarityFromDatabase('Ferrari', '458 Italia', 'Sports Car');
        expect(hypercar).toBeGreaterThan(sportscar);
    });

    it('provides production-based bonus for very limited cars', () => {
        // Pagani Zonda Cinque = 5 produced
        const limited = calculateRarityFromDatabase('Pagani', 'Zonda Cinque', 'Hypercar');
        // Pagani Huayra = 100 produced
        const lessLimited = calculateRarityFromDatabase('Pagani', 'Huayra', 'Hypercar');
        expect(limited).toBeGreaterThan(lessLimited);
    });

    it('handles null/undefined inputs gracefully', () => {
        const score = calculateRarityFromDatabase(null, null, null);
        expect(score).toBeGreaterThanOrEqual(1);
    });

    it('handles unknown brand with reasonable base score', () => {
        const score = calculateRarityFromDatabase('UnknownBrand', 'UnknownModel', 'Car');
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThan(30);
    });
});

// ═══════════════════════════════════════════
// getEstimatedMSRP
// ═══════════════════════════════════════════
describe('getEstimatedMSRP', () => {
    it('returns a positive number for any make/model', () => {
        const price = getEstimatedMSRP('Toyota', 'Camry');
        expect(price).toBeGreaterThan(0);
    });

    it('prices Bugatti higher than Toyota', () => {
        const bugatti = getEstimatedMSRP('Bugatti', 'Chiron');
        const toyota = getEstimatedMSRP('Toyota', 'Camry');
        expect(bugatti).toBeGreaterThan(toyota * 10);
    });

    it('returns specific override price for known models', () => {
        const chiron = getEstimatedMSRP('Bugatti', 'Chiron');
        expect(chiron).toBe(3000000);
    });

    it('uses brand base price for models without override', () => {
        const unknown = getEstimatedMSRP('Bugatti', 'FutureModel');
        expect(unknown).toBeGreaterThanOrEqual(2500000);
    });

    it('handles null inputs', () => {
        const price = getEstimatedMSRP(null, null);
        expect(price).toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════
// searchFullDatabase
// ═══════════════════════════════════════════
describe('searchFullDatabase', () => {
    it('returns empty array for short queries', () => {
        expect(searchFullDatabase('')).toEqual([]);
        expect(searchFullDatabase('a')).toEqual([]);
    });

    it('finds cars by make', () => {
        const results = searchFullDatabase('Ferrari');
        expect(results.length).toBeGreaterThan(5);
        results.forEach(car => {
            expect(car.make).toBe('Ferrari');
        });
    });

    it('finds cars by model name', () => {
        const results = searchFullDatabase('Chiron');
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results[0].model).toContain('Chiron');
    });

    it('finds cars by combined make + model', () => {
        const results = searchFullDatabase('Porsche 911');
        expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('is case insensitive', () => {
        const upper = searchFullDatabase('FERRARI');
        const lower = searchFullDatabase('ferrari');
        expect(upper.length).toBe(lower.length);
    });

    it('returns objects with required fields', () => {
        const results = searchFullDatabase('Bugatti');
        expect(results.length).toBeGreaterThan(0);
        const car = results[0];
        expect(car).toHaveProperty('id');
        expect(car).toHaveProperty('make');
        expect(car).toHaveProperty('model');
        expect(car).toHaveProperty('year');
        expect(car).toHaveProperty('category');
        expect(car).toHaveProperty('rarity');
        expect(car).toHaveProperty('image');
    });
});

// ═══════════════════════════════════════════
// getAllCarsForWishlist
// ═══════════════════════════════════════════
describe('getAllCarsForWishlist', () => {
    it('returns a non-empty array', () => {
        const cars = getAllCarsForWishlist();
        expect(Array.isArray(cars)).toBe(true);
        expect(cars.length).toBeGreaterThan(100);
    });

    it('returns cars sorted by rarity descending', () => {
        const cars = getAllCarsForWishlist();
        for (let i = 1; i < Math.min(cars.length, 50); i++) {
            expect(cars[i - 1].rarity).toBeGreaterThanOrEqual(cars[i].rarity);
        }
    });

    it('includes multiple brands', () => {
        const cars = getAllCarsForWishlist();
        const makes = new Set(cars.map(c => c.make));
        expect(makes.size).toBeGreaterThan(10);
    });

    it('each car has a valid image URL', () => {
        const cars = getAllCarsForWishlist();
        const sample = cars.slice(0, 20);
        sample.forEach(car => {
            expect(car.image).toBeDefined();
            expect(car.image.startsWith('http')).toBe(true);
        });
    });
});

// ═══════════════════════════════════════════
// getCarImage
// ═══════════════════════════════════════════
describe('getCarImage', () => {
    it('returns a URL string', () => {
        const url = getCarImage('Ferrari', '458 Italia');
        expect(typeof url).toBe('string');
        expect(url.startsWith('http')).toBe(true);
    });

    it('includes make and model in the URL', () => {
        const url = getCarImage('Toyota', 'Camry');
        expect(url).toContain('Toyota');
        expect(url).toContain('Camry');
    });

    it('normalizes Mercedes-AMG to Mercedes-Benz', () => {
        const url = getCarImage('Mercedes-AMG', 'GT');
        expect(url).toContain('Mercedes-Benz');
    });

    it('returns different URLs for different models', () => {
        const url1 = getCarImage('Ferrari', '458 Italia');
        const url2 = getCarImage('Ferrari', 'LaFerrari');
        // URLs differ in paint or model param
        expect(url1).not.toBe(url2);
    });
});
