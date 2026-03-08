import { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/mockData';
import { generateMockSpots } from '../data/mockData';

const AuthContext = createContext(null);

const STORAGE_KEY = 'carcues_auth';
const USERS_KEY = 'carcues_users';
const PASSWORDS_KEY = 'carcues_passwords';

/**
 * Simple hash function for password storage.
 * NOTE: This is NOT cryptographically secure — for production use bcrypt on a real backend.
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return 'h_' + Math.abs(hash).toString(36);
}

function initializeMockUsers() {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
        localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
        // Initialize spots for mock users
        const spots = {};
        MOCK_USERS.forEach(user => {
            spots[user.id] = generateMockSpots(user.id, Math.floor(Math.random() * 12) + 5);
        });
        localStorage.setItem('carcues_spots', JSON.stringify(spots));
    }

    // Migrate: ensure passwords exist for all users
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const existingPasswords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
    let passwordsChanged = false;

    users.forEach(user => {
        if (user.role === 'admin') {
            // Admin password is always reset to 'admin'
            existingPasswords[user.email] = simpleHash('admin');
            passwordsChanged = true;
        } else if (!existingPasswords[user.email]) {
            // Default password for mock/legacy users
            existingPasswords[user.email] = simpleHash('demo');
            passwordsChanged = true;
        }
    });

    if (passwordsChanged) {
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(existingPasswords));
    }

    return users;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeMockUsers();
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    }, []);

    const login = (username, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');

        // Match by username only
        const found = users.find(u => u.username === username);

        if (!found) {
            return { success: false, error: 'No account found with that username' };
        }

        // Verify password
        const storedHash = passwords[found.email];
        const inputHash = simpleHash(password);

        if (storedHash !== inputHash) {
            return { success: false, error: 'Incorrect password' };
        }

        setUser(found);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
        return { success: true, user: found };
    };

    const register = (username, email, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');

        // Validate username
        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
        }

        // Validate password
        if (password.length < 4) {
            return { success: false, error: 'Password must be at least 4 characters' };
        }

        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: 'Username already taken' };
        }

        const avatars = ['🏎️', '🔧', '💨', '⚙️', '🏁', '🚗', '🛞', '🔑', '🚀', '💎'];
        const newUser = {
            id: `user-${Date.now()}`,
            username,
            email,
            role: 'user',
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
            joinedAt: new Date().toISOString(),
        };

        // Store user
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Store password hash
        passwords[email] = simpleHash(password);
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));

        // Initialize empty spots for new user
        const spots = JSON.parse(localStorage.getItem('carcues_spots') || '{}');
        spots[newUser.id] = [];
        localStorage.setItem('carcues_spots', JSON.stringify(spots));

        setUser(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        return { success: true, user: newUser };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    /** Get all registered users (admin only) */
    const getAllUsers = () => {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    };

    /** Admin: reset a user's password */
    const resetUserPassword = (userEmail, newPassword) => {
        if (newPassword.length < 4) {
            return { success: false, error: 'Password must be at least 4 characters' };
        }
        const passwords = JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
        passwords[userEmail] = simpleHash(newPassword);
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
        return { success: true };
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading, getAllUsers, resetUserPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
