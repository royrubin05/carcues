import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuditLog, getAuditStats, clearAuditLog } from '../services/aiAuditService';
import StatsCard from '../components/StatsCard';
import './AdminPage.css';

const USERS_PER_PAGE = 10;

export default function AdminPage() {
    const { isAdmin, resetUserPassword } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [resetModal, setResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetMsg, setResetMsg] = useState('');
    const [auditPage, setAuditPage] = useState(1);

    const data = useMemo(() => {
        const users = JSON.parse(localStorage.getItem('carcues_users') || '[]');
        const allSpots = JSON.parse(localStorage.getItem('carcues_spots') || '{}');
        const allWishlists = JSON.parse(localStorage.getItem('carcues_wishlist') || '{}');

        const userStats = users.map(user => {
            const spots = allSpots[user.id] || [];
            const wishlist = allWishlists[user.id] || [];
            const totalRarityPoints = spots.reduce((sum, s) => sum + (s.car?.rarity || 0), 0);
            return {
                ...user,
                totalSpots: spots.length,
                wishlistCount: wishlist.length,
                totalRarityPoints,
                level: Math.floor(totalRarityPoints / 20) + 1,
            };
        });

        const totalSpots = userStats.reduce((s, u) => s + u.totalSpots, 0);
        const totalWishlist = userStats.reduce((s, u) => s + u.wishlistCount, 0);
        const totalPoints = userStats.reduce((s, u) => s + u.totalRarityPoints, 0);

        return { users: userStats, totalSpots, totalWishlist, totalPoints };
    }, []);

    // Filter users by search
    const filteredUsers = useMemo(() => {
        if (!search.trim()) return data.users;
        const q = search.toLowerCase();
        return data.users.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }, [data.users, search]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    const handleResetPassword = () => {
        if (!resetModal || !newPassword) return;
        const result = resetUserPassword(resetModal.email, newPassword);
        if (result.success) {
            setResetMsg(`Password reset for ${resetModal.username}`);
            setResetModal(null);
            setNewPassword('');
            setTimeout(() => setResetMsg(''), 3000);
        } else {
            setResetMsg(result.error);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>👑 Admin Dashboard</h1>
                <p>Manage users and track AI performance</p>
            </div>

            {/* Platform Stats */}
            <div className="stats-grid">
                <StatsCard icon="👥" label="Total Users" value={data.users.length} color="var(--accent-blue)" delay={0} />
                <StatsCard icon="📸" label="Total Spots" value={data.totalSpots} color="var(--accent-green)" delay={1} />
                <StatsCard icon="⭐" label="Total Wishlist Items" value={data.totalWishlist} color="var(--accent-orange)" delay={2} />
                <StatsCard icon="🏆" label="Total Rarity Points" value={data.totalPoints} color="var(--accent-gold)" delay={3} />
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
                                <span>Spotted</span>
                                <span>Wishlist</span>
                                <span>Rarity Pts</span>
                                <span>Level</span>
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
                                    <span className="admin-stat">{user.totalSpots}</span>
                                    <span className="admin-stat">{user.wishlistCount}</span>
                                    <span className="admin-stat points">{user.totalRarityPoints}</span>
                                    <span className="admin-stat level">LVL {user.level}</span>
                                    <span className="admin-date">
                                        {new Date(user.joinedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    <span className="admin-actions">
                                        <button
                                            className="btn btn-sm btn-ghost admin-action-btn"
                                            onClick={() => { setResetModal(user); setNewPassword(''); setResetMsg(''); }}
                                            title="Reset password"
                                        >
                                            🔑
                                        </button>
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

            {/* AI Performance Tab */}
            {activeTab === 'ai' && <AiPerformanceTab auditPage={auditPage} setAuditPage={setAuditPage} />}
        </div>
    );
}

const AUDIT_PER_PAGE = 15;

function AiPerformanceTab({ auditPage, setAuditPage }) {
    const stats = getAuditStats();
    const log = getAuditLog();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const totalAuditPages = Math.max(1, Math.ceil(log.length / AUDIT_PER_PAGE));
    const currentAuditPage = Math.min(auditPage, totalAuditPages);
    const sortedLog = [...log].reverse(); // newest first
    const paginatedLog = sortedLog.slice(
        (currentAuditPage - 1) * AUDIT_PER_PAGE,
        currentAuditPage * AUDIT_PER_PAGE
    );

    const handleClear = () => {
        clearAuditLog();
        setShowClearConfirm(false);
        setAuditPage(1);
    };

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

                {/* Top overridden makes */}
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

                {/* Pagination */}
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
