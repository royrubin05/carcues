import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ExplorePage.css';

export default function ExplorePage() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [debounce, setDebounce] = useState(null);

    const fetchUsers = useCallback(async (q = '') => {
        try {
            const res = await fetch(`/api/public/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (val) => {
        setSearch(val);
        if (debounce) clearTimeout(debounce);
        setDebounce(setTimeout(() => {
            fetchUsers(val);
        }, 300));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🌟 Showcase</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Discover spotters and browse their collections
                </p>
            </div>

            {/* My Showcase banner */}
            <Link to={`/u/${user?.username}`} className="explore-my-banner">
                <div className="explore-my-avatar">{user?.avatar || '🏎️'}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>My Showcase</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View & share your collection</div>
                </div>
                <span style={{ fontSize: '1.2rem' }}>→</span>
            </Link>

            {/* Search */}
            <div className="explore-search-bar">
                <input
                    type="text"
                    className="input"
                    placeholder="🔍 Search spotters by username..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Users Grid */}
            {loading ? (
                <div className="explore-loading">Loading spotters...</div>
            ) : users.length === 0 ? (
                <div className="explore-empty">
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                    <div>No spotters found{search ? ` for "${search}"` : ''}</div>
                </div>
            ) : (
                <div className="explore-grid">
                    {users.map(u => (
                        <Link
                            key={u.username}
                            to={`/u/${u.username}`}
                            className="explore-user-card"
                        >
                            {/* Top starred car image */}
                            {u.topStarred?.image ? (
                                <div className="explore-card-img-wrap">
                                    <img
                                        src={u.topStarred.image}
                                        alt={u.topStarred.model}
                                        className="explore-card-img"
                                    />
                                    <div className="explore-card-img-overlay">
                                        <span className="explore-starred-label">
                                            ⭐ {u.topStarred.make} {u.topStarred.model}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="explore-card-placeholder">
                                    <span>🏎️</span>
                                </div>
                            )}

                            {/* User info */}
                            <div className="explore-card-body">
                                <div className="explore-card-user">
                                    <span className="explore-card-avatar">{u.avatar}</span>
                                    <div>
                                        <div className="explore-card-name">{u.username}</div>
                                        <div className="explore-card-level">Level {u.level}</div>
                                    </div>
                                </div>
                                <div className="explore-card-stats">
                                    <div className="explore-stat">
                                        <span className="explore-stat-value">{u.spotCount}</span>
                                        <span className="explore-stat-label">Spots</span>
                                    </div>
                                    <div className="explore-stat">
                                        <span className="explore-stat-value">{u.totalRarity}</span>
                                        <span className="explore-stat-label">Points</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
