import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './LoginPage.css';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState(''); // '', 'loading', 'success', 'error'
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || password.length < 4) {
            setErrorMsg('Password must be at least 4 characters');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            return;
        }

        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await fetch('/api/auth/reset-password-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Failed to reset password');
            }
        } catch {
            setStatus('error');
            setErrorMsg('Something went wrong. Please try again.');
        }
    };

    if (!token) {
        return (
            <div className="login-page">
                <div className="login-bg">
                    <div className="login-grid" />
                    <div className="login-glow login-glow-1" />
                    <div className="login-glow login-glow-2" />
                </div>
                <div className="login-container animate-fade-in-up">
                    <div className="login-header">
                        <div className="login-logo">⚠️</div>
                        <h1 className="login-title">Invalid Link</h1>
                        <p className="login-subtitle">This reset link is invalid or has expired.</p>
                    </div>
                    <div className="login-toggle">
                        <Link to="/forgot-password" className="btn btn-primary">Request New Link</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-grid" />
                <div className="login-glow login-glow-1" />
                <div className="login-glow login-glow-2" />
            </div>

            <div className="login-container animate-fade-in-up">
                <div className="login-header">
                    <div className="login-logo">🔐</div>
                    <h1 className="login-title">Set New Password</h1>
                    <p className="login-subtitle">
                        {status === 'success'
                            ? 'Your password has been reset!'
                            : 'Enter your new password below.'}
                    </p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            You can now sign in with your new password.
                        </p>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                            Go to Sign In
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                                minLength={4}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                                minLength={4}
                                required
                            />
                        </div>

                        {errorMsg && (
                            <div className="login-error">{errorMsg}</div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? '⏳ Resetting...' : '🔐 Reset Password'}
                        </button>
                    </form>
                )}

                <div className="login-toggle">
                    <Link to="/login" className="btn btn-ghost">
                        ← Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
