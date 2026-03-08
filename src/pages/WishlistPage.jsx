import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserWishlist, addToWishlist, removeFromWishlist, getUserSpots } from '../services/carService';
import { searchFullDatabase, getEstimatedMSRP, getCarImage } from '../services/vehicleDataService';
import { getRarityTier } from '../data/mockData';
import RarityBadge from '../components/RarityBadge';
import './WishlistPage.css';

export default function WishlistPage() {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [spots, setSpots] = useState([]);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getUserWishlist(user.id), getUserSpots(user.id)])
            .then(([wishData, spotsData]) => { setWishlist(wishData); setSpots(spotsData); })
            .catch(err => console.error('Failed to load wishlist:', err))
            .finally(() => setLoading(false));
    }, [user.id]);

    const searchResults = useMemo(() => {
        if (!search) return [];
        return searchFullDatabase(search).filter(car => !wishlist.find(w => w.id === car.id));
    }, [search, wishlist]);

    const spottedCarIds = useMemo(() => new Set(spots.map(s => s.carId)), [spots]);

    const handleAdd = async (car) => {
        await addToWishlist(user.id, car);
        const updated = await getUserWishlist(user.id);
        setWishlist(updated);
        setSearch('');
    };

    const handleRemove = async (carId) => {
        await removeFromWishlist(user.id, carId);
        setWishlist(prev => prev.filter(w => w.id !== carId));
    };

    return (
        <div className="wishlist-page">
            <div className="page-header">
                <h1>⭐ Target Wishlist</h1>
                <p>Cars you want to spot in the wild</p>
            </div>

            {/* Add Car Section */}
            <div className="wishlist-add-section animate-fade-in-up">
                <button
                    className="btn btn-primary"
                    onClick={() => setShowSearch(!showSearch)}
                    id="toggle-add-car"
                >
                    {showSearch ? '✕ Close' : '+ Add Target Car'}
                </button>

                {showSearch && (
                    <div className="wishlist-search animate-fade-in-up">
                        <input
                            type="text"
                            className="input"
                            placeholder="🔍 Search for a car (e.g. Ferrari, GT3, Hypercar...)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            id="wishlist-search"
                        />

                        {searchResults.length > 0 && (
                            <div className="search-results">
                                <p className="search-count">{searchResults.length} cars found</p>
                                {searchResults.slice(0, 20).map(car => {
                                    const tier = getRarityTier(car.rarity);
                                    const msrp = getEstimatedMSRP(car.make, car.model);
                                    const formatPrice = (p) => p >= 1000000 ? `$${(p / 1000000).toFixed(1)}M` : `$${(p / 1000).toFixed(0)}K`;
                                    return (
                                        <div key={car.id} className="search-result-item">
                                            {car.image && <img src={car.image} alt={car.model} className="search-thumb" />}
                                            <div className="search-info">
                                                <span className="search-name">{car.make} {car.model}</span>
                                                <span className="search-meta">
                                                    {car.year} · {car.category}
                                                    {car.produced && ` · ${car.produced.toLocaleString()} made`}
                                                    {msrp && ` · ${formatPrice(msrp)}`}
                                                </span>
                                            </div>
                                            <RarityBadge score={car.rarity} size="sm" />
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleAdd(car)}
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {search && searchResults.length === 0 && (
                            <p className="search-no-results">No cars found matching "{search}"</p>
                        )}
                    </div>
                )}
            </div>

            {/* Wishlist Grid */}
            {wishlist.length > 0 ? (
                <div className="wishlist-grid stagger-children">
                    {wishlist.map(car => {
                        const tier = getRarityTier(car.rarity);
                        const isSpotted = spottedCarIds.has(car.id);
                        return (
                            <div
                                key={car.id}
                                className={`wishlist-card ${isSpotted ? 'spotted' : ''}`}
                                style={{ '--rarity-color': tier.color }}
                            >
                                <div className="wishlist-card-image">
                                    <img src={car.image || getCarImage(car.make, car.model)} alt={car.model} />
                                    {isSpotted && (
                                        <div className="spotted-badge">
                                            ✅ SPOTTED!
                                        </div>
                                    )}
                                </div>
                                <div className="wishlist-card-body">
                                    <h3>{car.make} {car.model}</h3>
                                    <div className="wishlist-card-meta">
                                        <span>{car.year}</span>
                                        <RarityBadge score={car.rarity} size="sm" />
                                    </div>
                                    <span className="wishlist-card-category">{car.category}</span>
                                    <button
                                        className="btn btn-ghost btn-sm wishlist-remove"
                                        onClick={() => handleRemove(car.id)}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">⭐</div>
                    <h3>Your wishlist is empty</h3>
                    <p>Add target cars you'd love to spot in the wild!</p>
                    <button className="btn btn-primary" onClick={() => setShowSearch(true)}>
                        + Add Your First Target
                    </button>
                </div>
            )}
        </div>
    );
}
