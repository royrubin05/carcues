import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

function VerifyBanner() {
    const { resendVerification } = useAuth();
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');

    const handleResend = async () => {
        setSending(true);
        setMsg('');
        const result = await resendVerification();
        setSending(false);
        if (result.success) {
            setMsg('✅ Verification email sent! Check your inbox.');
        } else {
            setMsg(`❌ ${result.error}`);
        }
    };

    return (
        <div style={{
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            margin: '8px 16px 0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
        }}>
            <span>📧 Please verify your email.</span>
            <button
                onClick={handleResend}
                disabled={sending}
                style={{
                    background: 'var(--accent-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: sending ? 'not-allowed' : 'pointer',
                    opacity: sending ? 0.6 : 1,
                }}
            >
                {sending ? 'Sending...' : 'Resend Email'}
            </button>
            {msg && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{msg}</span>}
        </div>
    );
}

export default function Layout() {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'var(--bg-primary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🏎️</div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading CarCues...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-layout">
            <Navbar />
            {!isAdmin && !user.email_verified && <VerifyBanner />}
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
