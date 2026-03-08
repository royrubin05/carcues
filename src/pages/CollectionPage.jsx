import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserSpots, removeSpot } from '../services/carService';
import { getEstimatedMSRP } from '../services/vehicleDataService';
import CarCard from '../components/CarCard';
import RarityBadge from '../components/RarityBadge';
import ShareButton from '../components/ShareButton';
import './CollectionPage.css';

export default function CollectionPage() {
    const { user } = useAuth();
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [filterRarity, setFilterRarity] = useState('all');
    const [selectedSpot, setSelectedSpot] = useState(null);

    useEffect(() => {
        getUserSpots(user.id)
            .then(data => setSpots(data))
            .catch(err => console.error('Failed to load spots:', err))
            .finally(() => setLoading(false));
    }, [user.id]);

    const filteredSpots = useMemo(() => {
        let result = [...spots];

        // Search filter
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.car.make.toLowerCase().includes(q) ||
                s.car.model.toLowerCase().includes(q) ||
                s.car.category.toLowerCase().includes(q)
            );
        }

        // Rarity filter (updated for 1-100+ scale)
        if (filterRarity !== 'all') {
            const ranges = {
                common: [0, 20],
                uncommon: [21, 35],
                rare: [36, 50],
                epic: [51, 70],
                legendary: [71, 85],
                mythic: [86, Infinity],
            };
            const [min, max] = ranges[filterRarity] || [0, Infinity];
            result = result.filter(s => s.car.rarity >= min && s.car.rarity <= max);
        }

        // Sort
        switch (sortBy) {
            case 'rarity-high':
                result.sort((a, b) => b.car.rarity - a.car.rarity);
                break;
            case 'rarity-low':
                result.sort((a, b) => a.car.rarity - b.car.rarity);
                break;
            case 'msrp-high':
                result.sort((a, b) => {
                    const msrpA = getEstimatedMSRP(a.car.make, a.car.model);
                    const msrpB = getEstimatedMSRP(b.car.make, b.car.model);
                    return msrpB - msrpA;
                });
                break;
            case 'msrp-low':
                result.sort((a, b) => {
                    const msrpA = getEstimatedMSRP(a.car.make, a.car.model);
                    const msrpB = getEstimatedMSRP(b.car.make, b.car.model);
                    return msrpA - msrpB;
                });
                break;
            case 'name':
                result.sort((a, b) => `${a.car.make} ${a.car.model}`.localeCompare(`${b.car.make} ${b.car.model}`));
                break;
            case 'date':
            default:
                result.sort((a, b) => new Date(b.spottedAt) - new Date(a.spottedAt));
                break;
        }

        return result;
    }, [spots, search, sortBy, filterRarity]);

    const handleDelete = async (spotId) => {
        await removeSpot(user.id, spotId);
        setSpots(prev => prev.filter(s => s.id !== spotId));
        setSelectedSpot(null);
    };

    // Format price for display
    const formatPrice = (price) => {
        if (!price) return 'N/A';
        if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
        return `$${(price / 1000).toFixed(0)}K`;
    };

    return (
        <div className="collection-page">
            <div className="page-header">
                <h1>🏆 My Collection</h1>
                <p>{spots.length} cars spotted</p>
            </div>

            {/* Filters */}
            <div className="collection-filters animate-fade-in-up">
                <input
                    type="text"
                    className="input"
                    placeholder="🔍 Search by make, model, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    id="collection-search"
                    style={{ maxWidth: '350px' }}
                />
                <select
                    className="input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    id="sort-select"
                    style={{ maxWidth: '220px' }}
                >
                    <option value="date">📅 Latest First</option>
                    <option value="rarity-high">🔥 Rarity: High → Low</option>
                    <option value="rarity-low">⬇️ Rarity: Low → High</option>
                    <option value="msrp-high">💰 MSRP: High → Low</option>
                    <option value="msrp-low">💵 MSRP: Low → High</option>
                    <option value="name">🔤 Name A-Z</option>
                </select>
                <select
                    className="input"
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    id="rarity-filter"
                    style={{ maxWidth: '200px' }}
                >
                    <option value="all">All Rarities</option>
                    <option value="common">⬜ Common (1-20)</option>
                    <option value="uncommon">🟩 Uncommon (21-35)</option>
                    <option value="rare">🟦 Rare (36-50)</option>
                    <option value="epic">🟪 Epic (51-70)</option>
                    <option value="legendary">🟨 Legendary (71-85)</option>
                    <option value="mythic">🔴 Mythic (86+)</option>
                </select>
            </div>

            {/* Grid */}
            {filteredSpots.length > 0 ? (
                <div className="car-grid">
                    {filteredSpots.map((spot, i) => (
                        <CarCard key={spot.id} spot={spot} delay={i} onClick={setSelectedSpot} />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h3>No cars found</h3>
                    <p>{search || filterRarity !== 'all' ? 'Try adjusting your filters' : 'Start spotting cars to build your collection!'}</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedSpot && (
                <div className="modal-overlay" onClick={() => setSelectedSpot(null)}>
                    <div className="modal-content animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedSpot(null)}>✕</button>
                        <img src={selectedSpot.car.image} alt={selectedSpot.car.model} className="modal-image" />
                        <div className="modal-body">
                            <h2>{selectedSpot.car.make} {selectedSpot.car.model}</h2>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <span className="car-card-year">{selectedSpot.car.year}</span>
                                <span className="car-card-category">{selectedSpot.car.category}</span>
                                <RarityBadge score={selectedSpot.car.rarity} />
                            </div>
                            {/* MSRP Display */}
                            <p style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: 'var(--font-md)', marginBottom: '8px' }}>
                                💰 Est. MSRP: {formatPrice(getEstimatedMSRP(selectedSpot.car.make, selectedSpot.car.model))}
                            </p>
                            {selectedSpot.location && (
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                    📍 {selectedSpot.location.city}
                                </p>
                            )}
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                                Spotted {new Date(selectedSpot.spottedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                <ShareButton
                                    url={`${window.location.origin}/spot/${selectedSpot.id}`}
                                    text={`Check out this ${selectedSpot.car.make} ${selectedSpot.car.model} I spotted on CarCues!`}
                                />
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(selectedSpot.id)}
                                    id="delete-spot-btn"
                                >
                                    🗑️ Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
