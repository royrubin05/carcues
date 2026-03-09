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
    const navItems = isAdmin
        ? [
            { to: '/admin', icon: '👑', label: 'Admin' },
            { to: '/leaderboard', icon: '🥇', label: 'Ranks' },
            { to: '/explore', icon: '🌟', label: 'Showcase' },
        ]
        : [
            { to: '/', icon: '🏠', label: 'Home' },
            { to: '/collection', icon: '🏆', label: 'Collection' },
            { to: '/upload', icon: '📸', label: 'Spot', isCenter: true },
            { to: '/leaderboard', icon: '🥇', label: 'Ranks' },
            { to: '/profile', icon: null, label: 'Profile', isProfile: true },
        ];

    // Desktop sidebar gets all links
    const sidebarItems = isAdmin
        ? [
            { to: '/admin', icon: '👑', label: 'Dashboard' },
            { to: '/leaderboard', icon: '🥇', label: 'Leaderboard' },
            { to: '/explore', icon: '🌟', label: 'Showcase' },
        ]
        : [
            { to: '/', icon: '🏠', label: 'Dashboard' },
            { to: '/upload', icon: '📸', label: 'Spot a Car' },
            { to: '/collection', icon: '🏆', label: 'Collection' },
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

            {/* Mobile: 5-tab bar */}
            <div className="navbar-links navbar-mobile">
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''} ${item.isCenter ? 'nav-center' : ''} ${item.isProfile ? 'nav-profile' : ''}`
                        }
                        end={item.to === '/'}
                    >
                        {item.isCenter ? (
                            <span className="nav-center-ring">
                                <span className="nav-icon">{item.icon}</span>
                            </span>
                        ) : item.isProfile ? (
                            <span className="nav-avatar-mini">{user?.avatar || '👤'}</span>
                        ) : (
                            <span className="nav-icon">{item.icon}</span>
                        )}
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Desktop: Full sidebar links */}
            <div className="navbar-links navbar-desktop">
                {sidebarItems.map(item => (
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
