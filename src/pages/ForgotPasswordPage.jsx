import { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginPage.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error);
            } else {
                setSubmitted(true);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-grid" />
                <div className="login-glow login-glow-1" />
                <div className="login-glow login-glow-2" />
            </div>

            <div className="login-container animate-fade-in-up">
                <div className="login-header">
                    <div className="login-logo">🔑</div>
                    <h1 className="login-title">Reset Password</h1>
                    <p className="login-subtitle">
                        {submitted
                            ? 'Check your email for a reset link.'
                            : 'Enter your email and we\'ll send a recovery link.'}
                    </p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="login-form" id="forgot-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="you@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="forgot-email"
                                autoComplete="email"
                            />
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            id="forgot-submit"
                            disabled={loading}
                        >
                            {loading ? '⏳ Sending...' : '📧 Send Recovery Email'}
                        </button>
                    </form>
                ) : (
                    <div className="forgot-success">
                        <div className="forgot-success-icon">✉️</div>
                        <p>If an account with that email exists, you'll receive a password reset link shortly.</p>
                    </div>
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
