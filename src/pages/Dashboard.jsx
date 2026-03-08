import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStats, getUserSpots } from '../services/carService';
import { getEstimatedMSRP } from '../services/vehicleDataService';
import StatsCard from '../components/StatsCard';
import CarCard from '../components/CarCard';
import { getRarityTier } from '../data/mockData';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentSpots, setRecentSpots] = useState([]);
    const [allSpots, setAllSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showVerifiedModal, setShowVerifiedModal] = useState(false);

    // Check if user just verified their email
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setShowVerifiedModal(true);
            // Clean up URL
            searchParams.delete('verified');
            setSearchParams(searchParams, { replace: true });
        }
    }, []);

    // Admin users are redirected to the admin dashboard
    if (isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    useEffect(() => {
        async function load() {
            try {
                const [statsData, spotsData] = await Promise.all([
                    getUserStats(user.id),
                    getUserSpots(user.id),
                ]);
                setStats(statsData);
                setAllSpots(spotsData);
                setRecentSpots(spotsData.slice(0, 4));
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user.id]);

    if (loading || !stats) {
        return (
            <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏎️</div>
                    Loading dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Welcome HUD */}
            <div className="dashboard-hud animate-fade-in-up">
                <div className="hud-welcome">
                    <span className="hud-avatar">{user.avatar}</span>
                    <div>
                        <h1 className="hud-greeting">Welcome back, {user.username}!</h1>
                        <p className="hud-subtitle">Ready to spot something legendary?</p>
                    </div>
                </div>
                <div className="hud-level">
                    <div className="level-badge">
                        <span className="level-number">LVL {stats.level}</span>
                    </div>
                    <div className="xp-bar">
                        <div className="xp-fill" style={{ width: `${stats.xpProgress}%` }} />
                    </div>
                    <span className="xp-text">{Math.floor(stats.xpProgress)}% to Level {stats.level + 1}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatsCard icon="📸" label="Total Spots" value={stats.totalSpots} color="var(--accent-blue)" delay={0} />
                <StatsCard icon="⭐" label="Rarity Points" value={stats.totalRarityPoints} color="var(--accent-gold)" delay={1} />
                <StatsCard icon="🏭" label="Unique Makes" value={stats.uniqueMakes} color="var(--accent-green)" delay={2} />
                <StatsCard icon="📊" label="Avg Rarity" value={stats.averageRarity} color="var(--accent-purple)" delay={3} />
                <StatsCard icon="💰" label="Collection Value" value={(() => {
                    const total = allSpots.reduce((sum, s) => sum + (getEstimatedMSRP(s.car.make, s.car.model) || 0), 0);
                    if (total >= 1000000) return `$${(total / 1000000).toFixed(1)}M`;
                    if (total >= 1000) return `$${(total / 1000).toFixed(0)}K`;
                    return `$${total}`;
                })()} color="var(--accent-cyan, #22d3ee)" delay={4} />
            </div>

            {/* Quick Actions */}
            <div className="dashboard-actions animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <Link to="/upload" className="action-card action-upload" id="quick-upload">
                    <span className="action-icon">📸</span>
                    <div>
                        <h3>Spot a Car</h3>
                        <p>Upload a photo for AI analysis</p>
                    </div>
                    <span className="action-arrow">→</span>
                </Link>
                <Link to="/explore" className="action-card action-showcase" id="quick-showcase">
                    <span className="action-icon">🌟</span>
                    <div>
                        <h3>Showcase</h3>
                        <p>Browse collections & share yours</p>
                    </div>
                    <span className="action-arrow">→</span>
                </Link>
                <Link to="/wishlist" className="action-card action-wishlist" id="quick-wishlist">
                    <span className="action-icon">⭐</span>
                    <div>
                        <h3>Wishlist</h3>
                        <p>{stats.wishlistCount} cars on your list</p>
                    </div>
                    <span className="action-arrow">→</span>
                </Link>
            </div>

            {/* Rarest Find */}
            {stats.rarestFind && (
                <div className="dashboard-rarest animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <h2 className="section-title">🏆 Your Rarest Find</h2>
                    <div className="rarest-card" style={{ '--rarity-color': getRarityTier(stats.rarestFind.car.rarity).color }}>
                        {stats.rarestFind.car.image && (
                            <img src={stats.rarestFind.car.image} alt={stats.rarestFind.car.model} className="rarest-image" />
                        )}
                        <div className="rarest-info">
                            <h3>{stats.rarestFind.car.make} {stats.rarestFind.car.model}</h3>
                            <p className="rarest-tier" style={{ color: getRarityTier(stats.rarestFind.car.rarity).color }}>
                                {getRarityTier(stats.rarestFind.car.rarity).name} · {stats.rarestFind.car.rarity}
                            </p>
                            {stats.rarestFind.location && (
                                <p className="rarest-location">📍 {stats.rarestFind.location.city}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Spots */}
            <div className="dashboard-recent animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="section-header">
                    <h2 className="section-title">🕐 Recent Spots</h2>
                    <Link to="/collection" className="btn btn-ghost btn-sm">View All →</Link>
                </div>
                <div className="car-grid">
                    {recentSpots.map((spot, i) => (
                        <CarCard key={spot.id} spot={spot} delay={i} />
                    ))}
                    {recentSpots.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 'var(--space-xl)' }}>
                            No spots yet! Upload a photo to start your collection.
                        </p>
                    )}
                </div>
            </div>

            {/* Email Verification Celebration Modal */}
            {showVerifiedModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, padding: '20px',
                }} onClick={() => setShowVerifiedModal(false)}>
                    <div style={{
                        background: 'var(--bg-secondary, #1a1a2e)',
                        border: '1px solid rgba(14, 165, 233, 0.2)',
                        borderRadius: '20px',
                        padding: '40px 36px',
                        maxWidth: '420px',
                        width: '100%',
                        textAlign: 'center',
                        animation: 'fadeInUp 0.4s ease-out',
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ color: '#22c55e', fontSize: '1.5rem', marginBottom: '12px' }}>
                            Email Verified!
                        </h2>
                        <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '8px', lineHeight: 1.6 }}>
                            Thank you for verifying, <strong>{user?.username}</strong>!
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px', lineHeight: 1.6 }}>
                            You're now logged in and ready to start spotting cool cars. 🏎️
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowVerifiedModal(false)}
                            style={{ padding: '12px 32px', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            🚀 Start Spotting
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
