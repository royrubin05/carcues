import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setToken as setApiToken } from '../services/apiClient';
import './LoginPage.css';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const { setUser } = useAuth();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found in the link.');
            return;
        }

        fetch(`/api/auth/verify-email?token=${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.success && data.token && data.user) {
                    // Auto-login: store session and redirect to dashboard
                    setApiToken(data.token);
                    setUser(data.user);
                    window.location.href = '/?verified=true';
                } else if (data.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            });
    }, [token]);

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-grid" />
                <div className="login-glow login-glow-1" />
                <div className="login-glow login-glow-2" />
            </div>

            <div className="login-container animate-fade-in-up" style={{ textAlign: 'center' }}>
                {status === 'loading' && (
                    <>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>📧</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.5rem' }}>
                            Verifying your email...
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Just a moment, we're confirming your account.</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ color: '#f59e0b', marginBottom: '12px', fontSize: '1.5rem' }}>
                            Verification Failed
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.6, fontSize: '0.95rem' }}>
                            {message}
                        </p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6, fontSize: '0.85rem' }}>
                            The link may have expired or already been used. Try logging in to request a new one.
                        </p>
                        <a href="/login" className="btn btn-primary login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Go to Login
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
