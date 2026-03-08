import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Admin users see management-only navigation
    // Regular users see the full car spotting experience
    const navItems = isAdmin
        ? [
            { to: '/admin', icon: '👑', label: 'Dashboard' },
        ]
        : [
            { to: '/', icon: '🏠', label: 'Dashboard' },
            { to: '/upload', icon: '📸', label: 'Spot a Car' },
            { to: '/collection', icon: '🏆', label: 'Collection' },
            // { to: '/map', icon: '🗺️', label: 'Map View' },
            { to: '/wishlist', icon: '⭐', label: 'Wishlist' },
            { to: '/leaderboard', icon: '🥇', label: 'Leaderboard' },
            { to: '/how-it-works', icon: '📖', label: 'How It Works' },
        ];

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="navbar-logo">
                    <img src="/logo.jpg" alt="CarCues" className="logo-image" />
                </div>
            </div>

            <div className="navbar-links">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        end={item.to === '/'}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="navbar-user">
                <div className="user-info">
                    <span className="user-avatar">{user?.avatar}</span>
                    <span className="user-name">{user?.username}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                    🚪 Logout
                </button>
            </div>
        </nav>
    );
}
