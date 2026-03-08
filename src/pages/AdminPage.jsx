import { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuditData, clearAuditLog } from '../services/aiAuditService';
import { api } from '../services/apiClient';
import { getEstimatedMSRP } from '../services/vehicleDataService';
import StatsCard from '../components/StatsCard';
import './AdminPage.css';

const USERS_PER_PAGE = 10;
const AUDIT_PER_PAGE = 15;

export default function AdminPage() {
    const { isAdmin, resetUserPassword } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [resetModal, setResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetMsg, setResetMsg] = useState('');
    const [auditPage, setAuditPage] = useState(1);

    // Create user form state
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState({ username: '', email: '', password: '', role: 'user' });
    const [createError, setCreateError] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // API data state
    const [users, setUsers] = useState([]);
    const [allSpots, setAllSpots] = useState([]);
    const [spotSearch, setSpotSearch] = useState('');
    const [platformStats, setPlatformStats] = useState({ totalUsers: 0, totalSpots: 0, totalWishlist: 0, totalPoints: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadAdminData() {
            try {
                const [usersData, statsData, spotsData] = await Promise.all([
                    api('/api/users'),
                    api('/api/admin/stats'),
                    api('/api/admin/spots'),
                ]);
                setUsers(usersData.users);
                setPlatformStats(statsData);
                setAllSpots(spotsData.spots || []);
            } catch (err) {
                console.error('Failed to load admin data:', err);
            } finally {
                setLoading(false);
            }
        }
        if (isAdmin) loadAdminData();
    }, [isAdmin]);

    // Filter users by search
    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }, [users, search]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    const handleResetPassword = async () => {
        if (!resetModal || !newPassword) return;
        const result = await resetUserPassword(resetModal.id, newPassword);
        if (result.success) {
            setResetMsg(`Password reset for ${resetModal.username}`);
            setResetModal(null);
            setNewPassword('');
            setTimeout(() => setResetMsg(''), 3000);
        } else {
            setResetMsg(result.error);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateError('');
        try {
            const data = await api('/api/users', {
                method: 'POST',
                body: JSON.stringify(createForm),
            });
            if (data.success) {
                setUsers(prev => [data.user, ...prev]);
                setCreateForm({ username: '', email: '', password: '', role: 'user' });
                setShowCreateForm(false);
                setResetMsg(`User "${data.user.username}" created successfully`);
                setTimeout(() => setResetMsg(''), 3000);
            } else {
                setCreateError(data.error || 'Failed to create user');
            }
        } catch (err) {
            setCreateError(err.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        try {
            const data = await api(`/api/users/${userId}`, { method: 'DELETE' });
            if (data.success) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                setDeleteConfirm(null);
                setResetMsg(`User "${username}" deleted`);
                setTimeout(() => setResetMsg(''), 3000);
            }
        } catch (err) {
            setResetMsg(err.message || 'Failed to delete user');
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="admin-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>👑</div>
                    Loading admin dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>👑 Admin Dashboard</h1>
                <p>Manage users and track AI performance</p>
            </div>

            {/* Platform Stats */}
            <div className="stats-grid">
                <StatsCard icon="👥" label="Total Users" value={platformStats.totalUsers} color="var(--accent-blue)" delay={0} />
                <StatsCard icon="📸" label="Total Spots" value={platformStats.totalSpots} color="var(--accent-green)" delay={1} />
                <StatsCard icon="⭐" label="Total Wishlist Items" value={platformStats.totalWishlist} color="var(--accent-orange)" delay={2} />
                <StatsCard icon="🏆" label="Total Rarity Points" value={platformStats.totalPoints} color="var(--accent-gold)" delay={3} />
                <StatsCard icon="💰" label="Platform Value" value={(() => {
                    const total = allSpots.reduce((sum, s) => sum + (getEstimatedMSRP(s.car.make, s.car.model) || 0), 0);
                    if (total >= 1000000) return `$${(total / 1000000).toFixed(1)}M`;
                    if (total >= 1000) return `$${(total / 1000).toFixed(0)}K`;
                    return `$${total}`;
                })()} color="var(--accent-cyan, #22d3ee)" delay={4} />
            </div>

            {/* Tab Navigation */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Users
                </button>
                <button
                    className={`admin-tab ${activeTab === 'spots' ? 'active' : ''}`}
                    onClick={() => setActiveTab('spots')}
                >
                    📸 All Spots
                </button>
                <button
                    className={`admin-tab ${activeTab === 'ai' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ai')}
                >
                    🤖 AI Performance
                </button>
            </div>

            {/* Success message */}
            {resetMsg && (
                <div className="admin-toast animate-fade-in-up">
                    ✅ {resetMsg}
                </div>
            )}

            {/* Users Table */}
            {activeTab === 'users' && (
                <>
                    {/* Create User Form */}
                    <div className="admin-table-container animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => { setShowCreateForm(!showCreateForm); setCreateError(''); }}
                            style={{ marginBottom: showCreateForm ? '16px' : 0 }}
                        >
                            {showCreateForm ? '✕ Cancel' : '➕ Create User'}
                        </button>

                        {showCreateForm && (
                            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Username</label>
                                    <input className="input" placeholder="username" value={createForm.username}
                                        onChange={e => setCreateForm(f => ({ ...f, username: e.target.value }))} required />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Email</label>
                                    <input className="input" type="email" placeholder="email@example.com" value={createForm.email}
                                        onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Password</label>
                                    <input className="input" type="password" placeholder="password" value={createForm.password}
                                        onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label>Role</label>
                                    <select className="input" value={createForm.role}
                                        onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button type="submit" className="btn btn-primary">Create User</button>
                                    {createError && <span style={{ color: 'var(--accent-red, #ef4444)', fontSize: '0.85rem' }}>{createError}</span>}
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="admin-table-container animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <div className="admin-table-toolbar">
                            <h2 className="section-title">All Users ({filteredUsers.length})</h2>
                            <input
                                type="text"
                                className="input admin-search"
                                placeholder="🔍 Search users..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                id="admin-search"
                            />
                        </div>

                        <div className="admin-table">
                            <div className="admin-table-header">
                                <span>User</span>
                                <span>Role</span>
                                <span>Joined</span>
                                <span>Actions</span>
                            </div>
                            {paginatedUsers.map(user => (
                                <div key={user.id} className="admin-table-row">
                                    <span className="admin-user-cell">
                                        <span className="admin-avatar">{user.avatar}</span>
                                        <div>
                                            <span className="admin-username">{user.username}</span>
                                            <span className="admin-email">{user.email}</span>
                                        </div>
                                    </span>
                                    <span>
                                        <span className={`role-badge ${user.role}`}>
                                            {user.role === 'admin' ? '👑 Admin' : '🏎️ User'}
                                        </span>
                                    </span>
                                    <span className="admin-date">
                                        {new Date(user.joined_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    <span className="admin-actions">
                                        {user.role !== 'admin' && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-ghost admin-action-btn"
                                                    onClick={() => { setResetModal(user); setNewPassword(''); setResetMsg(''); }}
                                                    title="Reset password"
                                                >
                                                    🔑
                                                </button>
                                                {deleteConfirm === user.id ? (
                                                    <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                        <button className="btn btn-sm" style={{ background: 'var(--accent-red, #ef4444)', color: 'white', fontSize: '0.75rem' }}
                                                            onClick={() => handleDeleteUser(user.id, user.username)}>Confirm</button>
                                                        <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem' }}
                                                            onClick={() => setDeleteConfirm(null)}>✕</button>
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-ghost admin-action-btn"
                                                        onClick={() => setDeleteConfirm(user.id)}
                                                        title="Delete user"
                                                        style={{ color: 'var(--accent-red, #ef4444)' }}
                                                    >
                                                        🗑️
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </span>
                                </div>
                            ))}
                            {paginatedUsers.length === 0 && (
                                <div className="admin-empty">No users found</div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="admin-pagination">
                                <button
                                    className="btn btn-sm btn-ghost"
                                    disabled={currentPage <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    ← Prev
                                </button>
                                <div className="admin-page-numbers">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className={`admin-page-btn ${p === currentPage ? 'active' : ''}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="btn btn-sm btn-ghost"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Reset Password Modal */}
                    {resetModal && (
                        <div className="admin-modal-overlay" onClick={() => setResetModal(null)}>
                            <div className="admin-modal animate-fade-in-up" onClick={e => e.stopPropagation()}>
                                <h3>🔑 Reset Password</h3>
                                <p className="admin-modal-user">
                                    {resetModal.avatar} <strong>{resetModal.username}</strong>
                                    <span>{resetModal.email}</span>
                                </p>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="Enter new password (min 4 chars)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        id="reset-password-input"
                                        autoFocus
                                    />
                                </div>
                                <div className="admin-modal-actions">
                                    <button className="btn btn-ghost" onClick={() => setResetModal(null)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleResetPassword}
                                        disabled={newPassword.length < 4}
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* All Spots Tab */}
            {activeTab === 'spots' && (
                <div className="admin-table-container animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="admin-table-toolbar">
                        <h2 className="section-title">All Spots ({allSpots.length})</h2>
                        <input
                            type="text"
                            className="input admin-search"
                            placeholder="🔍 Search by car, user..."
                            value={spotSearch}
                            onChange={(e) => setSpotSearch(e.target.value)}
                        />
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '16px',
                        marginTop: '12px',
                    }}>
                        {allSpots
                            .filter(s => {
                                if (!spotSearch) return true;
                                const q = spotSearch.toLowerCase();
                                return (
                                    s.car.make?.toLowerCase().includes(q) ||
                                    s.car.model?.toLowerCase().includes(q) ||
                                    s.spotter?.username?.toLowerCase().includes(q) ||
                                    s.location?.city?.toLowerCase().includes(q)
                                );
                            })
                            .map(spot => (
                                <a
                                    key={spot.id}
                                    href={`/spot/${spot.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'block',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border)',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    {spot.car.image && (
                                        <img
                                            src={spot.car.image}
                                            alt={spot.car.model}
                                            style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                                        />
                                    )}
                                    <div style={{ padding: '12px 14px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                                            {spot.car.make} {spot.car.model}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                            {spot.spotter?.avatar} {spot.spotter?.username}
                                            {spot.location?.city && ` · 📍 ${spot.location.city}`}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {new Date(spot.spottedAt).toLocaleDateString()}
                                            </span>
                                            <span style={{
                                                padding: '3px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: spot.car.rarity >= 70 ? 'var(--accent-gold)' :
                                                    spot.car.rarity >= 50 ? 'var(--accent-purple)' :
                                                        spot.car.rarity >= 35 ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                                                color: spot.car.rarity >= 35 ? '#000' : 'var(--text-secondary)',
                                            }}>
                                                ⭐ {spot.car.rarity}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                    </div>
                    {allSpots.length === 0 && (
                        <div className="admin-empty">No spots yet</div>
                    )}
                </div>
            )}

            {/* AI Performance Tab */}
            {activeTab === 'ai' && <AiPerformanceTab auditPage={auditPage} setAuditPage={setAuditPage} />}
        </div>
    );
}

function AiPerformanceTab({ auditPage, setAuditPage }) {
    const [auditData, setAuditData] = useState({ log: [], stats: { total: 0, accurate: 0, overridden: 0, accuracyRate: 0, highConfTotal: 0, highConfAccurate: 0, highConfRate: 0, lowConfTotal: 0, lowConfAccurate: 0, lowConfRate: 0, topOverriddenMakes: [] } });
    const [loading, setLoading] = useState(true);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        getAuditData()
            .then(data => setAuditData(data))
            .catch(err => console.error('Failed to load audit data:', err))
            .finally(() => setLoading(false));
    }, []);

    const { log, stats } = auditData;
    const totalAuditPages = Math.max(1, Math.ceil(log.length / AUDIT_PER_PAGE));
    const currentAuditPage = Math.min(auditPage, totalAuditPages);
    const paginatedLog = log.slice(
        (currentAuditPage - 1) * AUDIT_PER_PAGE,
        currentAuditPage * AUDIT_PER_PAGE
    );

    const handleClear = async () => {
        await clearAuditLog();
        setAuditData({ log: [], stats: { ...auditData.stats, total: 0, accurate: 0, overridden: 0, accuracyRate: 0 } });
        setShowClearConfirm(false);
        setAuditPage(1);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading AI audit data...</div>;
    }

    return (
        <div className="animate-fade-in-up">
            {/* AI Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="stat-card" style={{ '--delay': '0s', '--accent': stats.accuracyRate >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                    <div className="stat-icon" style={{ color: stats.accuracyRate >= 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>🎯</div>
                    <div className="stat-value">{stats.accuracyRate}%</div>
                    <div className="stat-label">AI Accuracy</div>
                </div>
                <div className="stat-card" style={{ '--delay': '0.1s', '--accent': 'var(--accent-blue)' }}>
                    <div className="stat-icon" style={{ color: 'var(--accent-blue)' }}>📊</div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Analyses</div>
                </div>
                <div className="stat-card" style={{ '--delay': '0.2s', '--accent': 'var(--accent-green)' }}>
                    <div className="stat-icon" style={{ color: 'var(--accent-green)' }}>✅</div>
                    <div className="stat-value">{stats.accurate}</div>
                    <div className="stat-label">Accurate</div>
                </div>
                <div className="stat-card" style={{ '--delay': '0.3s', '--accent': 'var(--accent-orange)' }}>
                    <div className="stat-icon" style={{ color: 'var(--accent-orange)' }}>✏️</div>
                    <div className="stat-value">{stats.overridden}</div>
                    <div className="stat-label">Overridden</div>
                </div>
            </div>

            {/* Confidence Breakdown */}
            <div className="admin-table-container" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="admin-table-toolbar">
                    <h2 className="section-title">Confidence Breakdown</h2>
                </div>
                <div style={{ padding: '0 var(--space-lg) var(--space-lg)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            High Confidence (≥80%)
                        </div>
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--accent-green)' }}>
                            {stats.highConfRate}%
                        </div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                            {stats.highConfAccurate} / {stats.highConfTotal} accurate
                        </div>
                    </div>
                    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Low Confidence (&lt;80%)
                        </div>
                        <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--accent-orange)' }}>
                            {stats.lowConfRate}%
                        </div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                            {stats.lowConfAccurate} / {stats.lowConfTotal} accurate
                        </div>
                    </div>
                </div>

                {stats.topOverriddenMakes.length > 0 && (
                    <div style={{ padding: '0 var(--space-lg) var(--space-lg)' }}>
                        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                            Most Overridden Makes
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {stats.topOverriddenMakes.map(([make, count]) => (
                                <span key={make} style={{
                                    padding: '4px 12px',
                                    background: 'var(--accent-orange-dim)',
                                    color: 'var(--accent-orange)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 'var(--font-xs)',
                                    fontWeight: 600,
                                }}>
                                    {make} ({count})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Audit Log Table */}
            <div className="admin-table-container">
                <div className="admin-table-toolbar">
                    <h2 className="section-title">Audit Log ({log.length})</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {!showClearConfirm ? (
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => setShowClearConfirm(true)}
                                disabled={log.length === 0}
                            >
                                🗑️ Clear Log
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-sm btn-ghost" onClick={() => setShowClearConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-sm btn-primary" onClick={handleClear} style={{ background: 'var(--accent-red)' }}>
                                    Confirm Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="admin-table">
                    <div className="audit-table-header">
                        <span>Date</span>
                        <span>AI Prediction</span>
                        <span>User Final</span>
                        <span>Confidence</span>
                        <span>Status</span>
                    </div>
                    {paginatedLog.map(entry => (
                        <div key={entry.id} className={`audit-table-row ${entry.wasOverridden ? 'overridden' : 'accurate'}`}>
                            <span className="admin-date">
                                {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                            </span>
                            <span style={{ fontSize: 'var(--font-sm)' }}>
                                <strong>{entry.aiPrediction?.make}</strong> {entry.aiPrediction?.model}
                                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', display: 'block' }}>
                                    {entry.aiPrediction?.year} • {entry.aiPrediction?.category}
                                </span>
                            </span>
                            <span style={{ fontSize: 'var(--font-sm)' }}>
                                {entry.wasOverridden ? (
                                    <>
                                        <strong style={{ color: 'var(--accent-orange)' }}>{entry.userFinal?.make}</strong> {entry.userFinal?.model}
                                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-xs)', display: 'block' }}>
                                            {entry.userFinal?.year} • {entry.userFinal?.category}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>— same —</span>
                                )}
                            </span>
                            <span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 'var(--font-xs)',
                                    fontWeight: 600,
                                    background: entry.confidence >= 80 ? 'var(--accent-green-dim)' : 'var(--accent-orange-dim)',
                                    color: entry.confidence >= 80 ? 'var(--accent-green)' : 'var(--accent-orange)',
                                }}>
                                    {entry.confidence}%
                                </span>
                            </span>
                            <span>
                                <span style={{
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: 'var(--font-xs)',
                                    fontWeight: 600,
                                    background: entry.wasOverridden ? 'var(--accent-orange-dim)' : 'var(--accent-green-dim)',
                                    color: entry.wasOverridden ? 'var(--accent-orange)' : 'var(--accent-green)',
                                }}>
                                    {entry.wasOverridden ? '✏️ Overridden' : '✅ Accurate'}
                                </span>
                            </span>
                        </div>
                    ))}
                    {log.length === 0 && (
                        <div className="admin-empty">
                            No AI analyses logged yet. Entries appear when users save car spots.
                        </div>
                    )}
                </div>

                {totalAuditPages > 1 && (
                    <div className="admin-pagination">
                        <button
                            className="btn btn-sm btn-ghost"
                            disabled={currentAuditPage <= 1}
                            onClick={() => setAuditPage(p => p - 1)}
                        >
                            ← Prev
                        </button>
                        <div className="admin-page-numbers">
                            {Array.from({ length: totalAuditPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    className={`admin-page-btn ${p === currentAuditPage ? 'active' : ''}`}
                                    onClick={() => setAuditPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <button
                            className="btn btn-sm btn-ghost"
                            disabled={currentAuditPage >= totalAuditPages}
                            onClick={() => setAuditPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
