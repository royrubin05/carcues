import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!username) {
            setError('Username is required');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }

        const result = login(username, password);
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
                    <div className="login-logo">🏎️</div>
                    <h1 className="login-title">CarCues</h1>
                    <p className="login-subtitle">Welcome back, spotter.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form" id="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            id="login-username"
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="login-password"
                            autoComplete="current-password"
                        />
                        <Link to="/forgot-password" className="forgot-password-link">
                            Forgot password?
                        </Link>
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button type="submit" className="btn btn-primary login-btn" id="auth-submit">
                        🏁 Sign In
                    </button>

                    <div className="login-demo-hint">
                        <p>Demo accounts:</p>
                        <button
                            type="button"
                            className="demo-btn"
                            onClick={() => { setUsername('SpeedDemon'); setPassword('demo'); }}
                        >
                            🏎️ SpeedDemon (User)
                        </button>
                        <button
                            type="button"
                            className="demo-btn"
                            onClick={() => { setUsername('AdminUser'); setPassword('admin'); }}
                        >
                            👑 Admin
                        </button>
                    </div>
                </form>

                <div className="login-toggle">
                    <Link to="/register" className="btn btn-ghost" id="go-to-register">
                        New here? Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
