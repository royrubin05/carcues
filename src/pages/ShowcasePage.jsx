import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRarityTier } from '../data/mockData';
import ShareButton from '../components/ShareButton';
import './ShowcasePage.css';

function getRarityColor(rarity) {
    if (rarity >= 70) return 'var(--accent-gold, #f59e0b)';
    if (rarity >= 50) return 'var(--accent-purple, #a855f7)';
    if (rarity >= 35) return 'var(--accent-blue, #0ea5e9)';
    return 'var(--bg-tertiary)';
}

function getRarityTextColor(rarity) {
    return rarity >= 35 ? '#000' : 'var(--text-secondary)';
}

export default function ShowcasePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/public/profile/${username}`);
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                } else {
                    setProfile(data.profile);
                }
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [username]);

    if (loading) {
        return (
            <div className="showcase-page">
                <div className="showcase-loading">
                    <div>🏎️ Loading showcase...</div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="showcase-page">
                <div className="showcase-loading">
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>😕</div>
                        <div>{error || 'Profile not found'}</div>
                        <Link to="/" style={{ color: 'var(--accent-blue)', marginTop: '16px', display: 'block' }}>
                            ← Go to CarCues
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const starredSpots = (profile.spots || []).filter(s => s.starred);
    const collectionSpots = (profile.spots || []).filter(s => !s.starred);
    const shareUrl = `https://www.carcues.com/u/${profile.username}`;
    const joinDate = new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className="showcase-page">
            {/* Ambient BG */}
            <div className="showcase-bg">
                <div className="showcase-glow-1" />
                <div className="showcase-glow-2" />
            </div>

            <div className="showcase-content">
                {/* ── Hero ── */}
                <div className="showcase-hero">
                    <div className="showcase-avatar">{profile.avatar}</div>
                    <div className="showcase-username">{profile.username}</div>
                    <div className="showcase-joined">Member since {joinDate}</div>
                    <div className="showcase-level">
                        🏆 Level {profile.level}
                    </div>
                    <div className="showcase-share-row">
                        <ShareButton
                            url={shareUrl}
                            text={`Check out ${profile.username}'s car collection on CarCues!`}
                        />
                    </div>
                </div>

                {/* ── Metrics ── */}
                <div className="showcase-metrics">
                    <div className="showcase-metric">
                        <div className="showcase-metric-value">{profile.totalSpots}</div>
                        <div className="showcase-metric-label">Spots</div>
                    </div>
                    <div className="showcase-metric">
                        <div className="showcase-metric-value">{profile.totalRarityPoints}</div>
                        <div className="showcase-metric-label">Rarity Points</div>
                    </div>
                    <div className="showcase-metric">
                        <div className="showcase-metric-value">{profile.uniqueMakes || 0}</div>
                        <div className="showcase-metric-label">Unique Makes</div>
                    </div>
                    <div className="showcase-metric">
                        <div className="showcase-metric-value">{profile.rarestFind?.rarity || '—'}</div>
                        <div className="showcase-metric-label">Rarest Find</div>
                    </div>
                </div>

                {/* Rarest Find callout */}
                {profile.rarestFind && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '28px',
                        padding: '12px 16px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.15)',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        color: 'var(--accent-gold, #f59e0b)',
                    }}>
                        🏆 Rarest find: <strong>{profile.rarestFind.name}</strong> — ⭐ {profile.rarestFind.rarity}
                    </div>
                )}

                {/* ── Featured (Starred) Cars ── */}
                {starredSpots.length > 0 && (
                    <>
                        <div className="showcase-section-title">⭐ Featured</div>
                        <div className="showcase-featured-grid">
                            {starredSpots.map(spot => (
                                <a
                                    key={spot.id}
                                    href={`/spot/${spot.id}`}
                                    className="showcase-card featured"
                                >
                                    <div className="showcase-card-wrapper">
                                        {spot.car.image && (
                                            <img src={spot.car.image} alt={spot.car.model} className="showcase-card-img" />
                                        )}
                                        <div className="showcase-star">⭐</div>
                                    </div>
                                    <div className="showcase-card-body">
                                        <div className="showcase-card-name">
                                            {spot.car.make} {spot.car.model}
                                        </div>
                                        <div className="showcase-card-meta">
                                            <span>{spot.car.year || ''}{spot.location?.city ? ` · ${spot.location.city}` : ''}</span>
                                            <span className="showcase-rarity-badge" style={{
                                                background: getRarityColor(spot.car.rarity),
                                                color: getRarityTextColor(spot.car.rarity),
                                            }}>
                                                ⭐ {spot.car.rarity}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </>
                )}

                {/* ── Collection ── */}
                {collectionSpots.length > 0 && (
                    <>
                        <div className="showcase-section-title">📸 Collection</div>
                        <div className="showcase-collection-grid">
                            {collectionSpots.map(spot => (
                                <a
                                    key={spot.id}
                                    href={`/spot/${spot.id}`}
                                    className="showcase-card"
                                >
                                    {spot.car.image && (
                                        <img src={spot.car.image} alt={spot.car.model} className="showcase-card-img" />
                                    )}
                                    <div className="showcase-card-body">
                                        <div className="showcase-card-name">
                                            {spot.car.make} {spot.car.model}
                                        </div>
                                        <div className="showcase-card-meta">
                                            <span className="showcase-rarity-badge" style={{
                                                background: getRarityColor(spot.car.rarity),
                                                color: getRarityTextColor(spot.car.rarity),
                                            }}>
                                                ⭐ {spot.car.rarity}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </>
                )}

                {(profile.spots || []).length === 0 && (
                    <div className="showcase-empty">
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏎️</div>
                        <div>{profile.username} hasn't spotted any cars yet.</div>
                    </div>
                )}

                {/* ── Footer ── */}
                <div className="showcase-footer">
                    <div className="showcase-footer-logo">CarCues</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Spot rare cars. Build your collection.
                    </div>
                    <a href="/register" className="showcase-footer-cta">
                        🏎️ Join CarCues
                    </a>
                </div>
            </div>
        </div>
    );
}
