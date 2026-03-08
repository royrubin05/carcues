import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = await register(username, email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
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
                    <img src="/logo.jpg" alt="CarCues" className="login-logo-img" />
                    <p className="login-subtitle">Join the hunt. Spot rare cars.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form" id="register-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Pick a unique name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            id="register-username"
                            autoComplete="username"
                        />
                        <span className="input-hint">Letters, numbers, underscores only</span>
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="you@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="register-email"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Choose a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="register-password"
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            id="register-confirm-password"
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="btn btn-primary login-btn" id="register-submit">
                        🚀 Create Account
                    </button>
                </form>

                <div className="login-toggle">
                    <Link to="/login" className="btn btn-ghost" id="go-to-login">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
