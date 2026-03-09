import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    const showcaseUrl = `https://www.carcues.com/u/${user?.username}`;

    const handleShareShowcase = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${user?.username}'s Car Collection — CarCues`,
                    text: `Check out ${user?.username}'s car collection on CarCues!`,
                    url: showcaseUrl,
                });
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(showcaseUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [user, showcaseUrl]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="page-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="page-header" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{user?.avatar}</div>
                <h1>{user?.username}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                <Link to={`/u/${user?.username}`} className="btn btn-primary" style={{ textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '0.95rem' }}>
                    🌐 View My Showcase
                </Link>
                <button
                    onClick={handleShareShowcase}
                    className="btn"
                    style={{
                        textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '0.95rem',
                        background: 'linear-gradient(135deg, var(--accent-blue), #0284c7)',
                        color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600,
                    }}
                >
                    {copied ? '✅ Link Copied!' : '🔗 Share My Showcase'}
                </button>

                <div style={{ height: '8px' }} />

                <Link to="/how-it-works" className="btn btn-ghost" style={{ textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', border: '1px solid var(--border)' }}>
                    📖 How It Works
                </Link>
                <button
                    onClick={handleLogout}
                    className="btn btn-ghost"
                    style={{ textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '0.95rem', border: '1px solid var(--border)', color: 'var(--accent-red, #ef4444)', marginTop: '8px', cursor: 'pointer', background: 'none', width: '100%' }}
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}
