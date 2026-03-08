// ═══════════════════════════════════════════
// CarCues Mock Data — Cars, Users, and Spots
// ═══════════════════════════════════════════

export const CAR_DATABASE = [
  { id: 1, make: 'Lamborghini', model: 'Aventador SVJ', year: 2022, rarity: 9, category: 'Supercar', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop' },
  { id: 2, make: 'Ferrari', model: '488 Pista', year: 2021, rarity: 8, category: 'Supercar', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop' },
  { id: 3, make: 'McLaren', model: '720S', year: 2023, rarity: 8, category: 'Supercar', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&h=400&fit=crop' },
  { id: 4, make: 'Porsche', model: '911 GT3 RS', year: 2023, rarity: 7, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&h=400&fit=crop' },
  { id: 5, make: 'Bugatti', model: 'Chiron', year: 2022, rarity: 10, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1566023888064-55aa7db9437a?w=600&h=400&fit=crop' },
  { id: 6, make: 'Pagani', model: 'Huayra BC', year: 2021, rarity: 10, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop' },
  { id: 7, make: 'Koenigsegg', model: 'Jesko', year: 2023, rarity: 10, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1555353540-64580b51c258?w=600&h=400&fit=crop' },
  { id: 8, make: 'Aston Martin', model: 'Valkyrie', year: 2022, rarity: 10, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&h=400&fit=crop' },
  { id: 9, make: 'BMW', model: 'M4 Competition', year: 2023, rarity: 4, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=600&h=400&fit=crop' },
  { id: 10, make: 'Mercedes-AMG', model: 'GT Black Series', year: 2022, rarity: 8, category: 'Supercar', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop' },
  { id: 11, make: 'Nissan', model: 'GT-R Nismo', year: 2023, rarity: 6, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop' },
  { id: 12, make: 'Ford', model: 'GT', year: 2022, rarity: 9, category: 'Supercar', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop' },
  { id: 13, make: 'Chevrolet', model: 'Corvette Z06', year: 2024, rarity: 5, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop' },
  { id: 14, make: 'Toyota', model: 'GR Supra', year: 2023, rarity: 3, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&h=400&fit=crop' },
  { id: 15, make: 'Dodge', model: 'Viper ACR', year: 2017, rarity: 7, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1611859266648-742dc8bab6c4?w=600&h=400&fit=crop' },
  { id: 16, make: 'Lexus', model: 'LFA', year: 2012, rarity: 9, category: 'Supercar', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&h=400&fit=crop' },
  { id: 17, make: 'Honda', model: 'NSX Type S', year: 2022, rarity: 6, category: 'Supercar', image: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=400&fit=crop' },
  { id: 18, make: 'Audi', model: 'R8 V10 Performance', year: 2023, rarity: 5, category: 'Supercar', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=600&h=400&fit=crop' },
  { id: 19, make: 'Maserati', model: 'MC20', year: 2023, rarity: 6, category: 'Supercar', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&h=400&fit=crop' },
  { id: 20, make: 'Rolls-Royce', model: 'Phantom', year: 2023, rarity: 7, category: 'Luxury', image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=600&h=400&fit=crop' },
  { id: 21, make: 'Bentley', model: 'Continental GT Speed', year: 2023, rarity: 5, category: 'Luxury', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop' },
  { id: 22, make: 'Tesla', model: 'Roadster', year: 2024, rarity: 8, category: 'Electric', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop' },
  { id: 23, make: 'Rimac', model: 'Nevera', year: 2023, rarity: 10, category: 'Electric Hypercar', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop' },
  { id: 24, make: 'Porsche', model: '918 Spyder', year: 2015, rarity: 9, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=600&h=400&fit=crop' },
  { id: 25, make: 'Ferrari', model: 'LaFerrari', year: 2016, rarity: 10, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=600&h=400&fit=crop' },
  { id: 26, make: 'Shelby', model: 'GT500', year: 2023, rarity: 4, category: 'Muscle Car', image: 'https://images.unsplash.com/photo-1584345604476-8ec5f82d661f?w=600&h=400&fit=crop' },
  { id: 27, make: 'Lotus', model: 'Evija', year: 2024, rarity: 10, category: 'Electric Hypercar', image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=600&h=400&fit=crop' },
  { id: 28, make: 'Alpine', model: 'A110 S', year: 2023, rarity: 6, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1525609004556-c46c6c5104b8?w=600&h=400&fit=crop' },
  { id: 29, make: 'Mazda', model: 'MX-5 Miata', year: 2024, rarity: 2, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop' },
  { id: 30, make: 'Subaru', model: 'WRX STI', year: 2021, rarity: 4, category: 'Rally', image: 'https://images.unsplash.com/photo-1580274455191-1c62238ce452?w=600&h=400&fit=crop' },
  { id: 31, make: 'Mitsubishi', model: 'Lancer Evolution X', year: 2015, rarity: 6, category: 'Rally', image: 'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=600&h=400&fit=crop' },
  { id: 32, make: 'Jaguar', model: 'F-Type R', year: 2023, rarity: 5, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop' },
  { id: 33, make: 'Land Rover', model: 'Defender V8', year: 2023, rarity: 4, category: 'SUV', image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27a5?w=600&h=400&fit=crop' },
  { id: 34, make: 'Mercedes-Benz', model: 'G63 AMG', year: 2024, rarity: 4, category: 'SUV', image: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=600&h=400&fit=crop' },
  { id: 35, make: 'Ferrari', model: 'SF90 Stradale', year: 2023, rarity: 9, category: 'Supercar', image: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=600&h=400&fit=crop' },
  { id: 36, make: 'Lamborghini', model: 'Huracán STO', year: 2023, rarity: 8, category: 'Supercar', image: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?w=600&h=400&fit=crop' },
  { id: 37, make: 'McLaren', model: 'P1', year: 2015, rarity: 10, category: 'Hypercar', image: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=400&fit=crop' },
  { id: 38, make: 'Porsche', model: 'Taycan Turbo S', year: 2024, rarity: 5, category: 'Electric', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop' },
  { id: 39, make: 'BMW', model: 'Z4 M40i', year: 2023, rarity: 3, category: 'Sports Car', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=400&fit=crop' },
  { id: 40, make: 'Chevrolet', model: 'Camaro ZL1', year: 2023, rarity: 4, category: 'Muscle Car', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop' },
];

// US city coordinates for realistic map pins
const CITY_COORDS = [
  { city: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { city: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
  { city: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { city: 'Las Vegas, NV', lat: 36.1699, lng: -115.1398 },
  { city: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { city: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { city: 'Scottsdale, AZ', lat: 33.4942, lng: -111.9261 },
  { city: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
  { city: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
  { city: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
  { city: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
  { city: 'Nashville, TN', lat: 36.1627, lng: -86.7816 },
  { city: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
  { city: 'Boston, MA', lat: 42.3601, lng: -71.0589 },
];

function randomOffset() {
  return (Math.random() - 0.5) * 0.1;
}

function randomDate(daysBack = 90) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString();
}

// Generate mock spotted cars with locations
export function generateMockSpots(userId, count = 12) {
  const spots = [];
  const usedCarIds = new Set();

  for (let i = 0; i < count; i++) {
    let car;
    do {
      car = CAR_DATABASE[Math.floor(Math.random() * CAR_DATABASE.length)];
    } while (usedCarIds.has(car.id) && usedCarIds.size < CAR_DATABASE.length);
    usedCarIds.add(car.id);

    const location = CITY_COORDS[Math.floor(Math.random() * CITY_COORDS.length)];

    spots.push({
      id: `spot-${userId}-${i}`,
      carId: car.id,
      userId,
      car: { ...car },
      location: {
        city: location.city,
        lat: location.lat + randomOffset(),
        lng: location.lng + randomOffset(),
      },
      spottedAt: randomDate(),
      photoUrl: car.image,
      notes: '',
    });
  }

  return spots.sort((a, b) => new Date(b.spottedAt) - new Date(a.spottedAt));
}

// Mock users
export const MOCK_USERS = [
  { id: 'user-1', username: 'SpeedDemon', email: 'speed@demo.com', role: 'user', avatar: '🏎️', joinedAt: '2025-06-15T00:00:00Z' },
  { id: 'user-2', username: 'V8Hunter', email: 'v8@demo.com', role: 'user', avatar: '🔧', joinedAt: '2025-07-20T00:00:00Z' },
  { id: 'user-3', username: 'TurboTracker', email: 'turbo@demo.com', role: 'user', avatar: '💨', joinedAt: '2025-08-01T00:00:00Z' },
  { id: 'user-4', username: 'ExoticEye', email: 'exotic@demo.com', role: 'user', avatar: '👁️', joinedAt: '2025-09-10T00:00:00Z' },
  { id: 'user-5', username: 'GearHead', email: 'gear@demo.com', role: 'user', avatar: '⚙️', joinedAt: '2025-10-05T00:00:00Z' },
  { id: 'admin-1', username: 'Admin', email: 'admin@carcues.com', role: 'admin', avatar: '👑', joinedAt: '2025-01-01T00:00:00Z' },
];

// Generate spots for each mock user
export const MOCK_USER_SPOTS = {};
MOCK_USERS.forEach(user => {
  const spotCount = Math.floor(Math.random() * 15) + 5;
  MOCK_USER_SPOTS[user.id] = generateMockSpots(user.id, spotCount);
});

// Rarity tier helpers (1–100 scale)
export function getRarityTier(score) {
  if (score <= 20) return { name: 'Common', color: 'var(--rarity-common)', className: 'rarity-common' };
  if (score <= 35) return { name: 'Uncommon', color: 'var(--rarity-uncommon)', className: 'rarity-uncommon' };
  if (score <= 50) return { name: 'Rare', color: 'var(--rarity-rare)', className: 'rarity-rare' };
  if (score <= 70) return { name: 'Epic', color: 'var(--rarity-epic)', className: 'rarity-epic' };
  if (score <= 85) return { name: 'Legendary', color: 'var(--rarity-legendary)', className: 'rarity-legendary' };
  return { name: 'Mythic', color: 'var(--rarity-mythic)', className: 'rarity-mythic' };
}

export function getRarityEmoji(score) {
  if (score <= 20) return '⬜';
  if (score <= 35) return '🟩';
  if (score <= 50) return '🟦';
  if (score <= 70) return '🟪';
  if (score <= 85) return '🟨';
  return '🔴';
}
