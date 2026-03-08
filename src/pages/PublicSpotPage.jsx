import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRarityTier } from '../data/mockData';
import RarityBadge from '../components/RarityBadge';
import ShareButton from '../components/ShareButton';
import './PublicPages.css';

export default function PublicSpotPage() {
    const { id } = useParams();
    const [spot, setSpot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`/api/public/spot/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.spot) setSpot(data.spot);
                else setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="public-page"><div className="public-loading">Loading spot...</div></div>;
    if (error || !spot) return (
        <div className="public-page">
            <PublicNav />
            <div className="public-not-found">
                <h2>Spot not found</h2>
                <p>This spot may have been removed.</p>
                <Link to="/login" className="public-nav-cta" style={{ display: 'inline-block', marginTop: '16px' }}>Join CarCues</Link>
            </div>
        </div>
    );

    const tier = getRarityTier(spot.car.rarity);

    return (
        <div className="public-page">
            <PublicNav />
            <div className="public-spot-hero animate-fade-in-up">
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
                            <span>{new Date(spot.spottedAt).toLocaleDateString()}</span>
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
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', gap: '12px' }}>
                    <ShareButton url={window.location.href} text={`Check out this ${spot.car.make} ${spot.car.model} spotted on CarCues!`} />
                </div>
            </div>
        </div>
    );
}

function PublicNav() {
    const navigate = useNavigate();
    const handleBack = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/');
    };
    return (
        <nav className="public-nav">
            <button onClick={handleBack} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '8px 16px', color: 'var(--text-secondary)',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.2s', WebkitTapHighlightColor: 'transparent',
            }}>← Back</button>
            <Link to="/" className="public-nav-logo">
                <img src="/logo.jpg" alt="CarCues" />
            </Link>
            <Link to="/register" className="public-nav-cta">Join CarCues</Link>
        </nav>
    );
}

export { PublicNav };
