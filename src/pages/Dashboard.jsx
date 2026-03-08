import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserStats, getUserSpots } from '../services/carService';
import StatsCard from '../components/StatsCard';
import CarCard from '../components/CarCard';
import { getRarityTier } from '../data/mockData';
import { Link, Navigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentSpots, setRecentSpots] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <Link to="/map" className="action-card action-map" id="quick-map">
                    <span className="action-icon">🗺️</span>
                    <div>
                        <h3>Map View</h3>
                        <p>See all spotted locations</p>
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
        </div>
    );
}
