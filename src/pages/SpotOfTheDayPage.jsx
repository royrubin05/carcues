import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRarityTier } from '../data/mockData';
import RarityBadge from '../components/RarityBadge';
import ShareButton from '../components/ShareButton';
import { PublicNav } from './PublicSpotPage';
import './PublicPages.css';

export default function SpotOfTheDayPage() {
    const [spot, setSpot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/public/spot-of-the-day')
            .then(r => r.json())
            .then(data => setSpot(data.spotOfTheDay))
            .catch(err => console.error('SOTD error:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="public-page"><div className="public-loading">Loading Spot of the Day...</div></div>;

    return (
        <div className="public-page">
            <PublicNav />
            <div className="sotd-hero animate-fade-in-up">
                <div className="sotd-badge">
                    <span className="sotd-badge-text">⭐ SPOT OF THE DAY</span>
                </div>

                {spot ? (
                    <div className="public-spot-card">
                        {spot.car.image && (
                            <img src={spot.car.image} alt={`${spot.car.make} ${spot.car.model}`} className="public-spot-image" />
                        )}
                        <div className="public-spot-info">
                            <h1 className="public-spot-title">{spot.car.make} {spot.car.model}</h1>
                            <div className="public-spot-meta">
                                {spot.car.year && <span>{spot.car.year}</span>}
                                {spot.car.category && <span>{spot.car.category}</span>}
                                {spot.location?.city && <span>📍 {spot.location.city}</span>}
                            </div>
                            <RarityBadge score={spot.car.rarity} />
                            {spot.spotter && (
                                <div className="public-spot-spotter">
                                    <span className="avatar">{spot.spotter.avatar}</span>
                                    <span>Spotted by <strong><Link to={`/u/${spot.spotter.username}`} style={{ color: 'var(--accent-blue)' }}>{spot.spotter.username}</Link></strong></span>
                                </div>
                            )}
                        </div>
                        <div className="public-spot-watermark">
                            Spotted on CarCues — carcues.com
                        </div>
                    </div>
                ) : (
                    <div className="public-not-found">
                        <h2>No spots yet today</h2>
                        <p>Be the first to spot a car and get featured!</p>
                        <Link to="/register" className="public-nav-cta" style={{ display: 'inline-block', marginTop: '16px' }}>
                            Start Spotting
                        </Link>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <ShareButton
                        url={window.location.href}
                        text={spot ? `Today's top car spot: ${spot.car.make} ${spot.car.model} on CarCues!` : 'Check out CarCues — the car spotting app!'}
                    />
                </div>
            </div>
        </div>
    );
}
