import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './LoginPage.css';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found in the link.');
            return;
        }

        fetch(`/api/auth/verify-email?token=${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    setStatus(data.message?.includes('already') ? 'already' : 'success');
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
                {/* Loading */}
                {status === 'loading' && (
                    <>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>📧</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.5rem' }}>
                            Verifying your email...
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Just a moment, we're confirming your account.</p>
                    </>
                )}

                {/* Success */}
                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
                        <h2 style={{ color: '#22c55e', marginBottom: '12px', fontSize: '1.5rem' }}>
                            Email Verified!
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.6, fontSize: '0.95rem' }}>
                            Your email has been successfully verified.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6, fontSize: '0.95rem' }}>
                            You're all set — head to the login page to sign in and start spotting rare cars!
                        </p>
                        <Link to="/login" className="btn btn-primary login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            🏎️ Go to Login
                        </Link>
                    </>
                )}

                {/* Already verified */}
                {status === 'already' && (
                    <>
                        <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>👍</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.5rem' }}>
                            Already Verified
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6, fontSize: '0.95rem' }}>
                            Your email was already verified. You can log in anytime!
                        </p>
                        <Link to="/login" className="btn btn-primary login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            🏎️ Go to Login
                        </Link>
                    </>
                )}

                {/* Error */}
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
                            The link may have expired or already been used. Log in to request a new verification email.
                        </p>
                        <Link to="/login" className="btn btn-primary login-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Go to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
