import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if we have a valid session
    useEffect(() => {
        const token = getToken();
        if (token) {
            api('/api/auth/me')
                .then(data => setUser(data.user))
                .catch(() => setToken(null)) // token is invalid/expired
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const data = await api('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password }),
            });
            setToken(data.token);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (username, email, password) => {
        try {
            const data = await api('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, email, password }),
            });
            if (data.needsVerification) {
                return { success: true, needsVerification: true, message: data.message };
            }
            setToken(data.token);
            setUser(data.user);
            return { success: true, user: data.user };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = async () => {
        try {
            await api('/api/auth/logout', { method: 'POST' });
        } catch {
            // ignore logout errors
        }
        setToken(null);
        setUser(null);
    };

    /** Admin: reset a user's password */
    const resetUserPassword = async (userId, newPassword) => {
        try {
            await api('/api/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ userId, newPassword }),
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    /** Resend email verification */
    const resendVerification = async () => {
        try {
            const data = await api('/api/auth/resend-verification', { method: 'POST' });
            return { success: true, message: data.message };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    /** Mark user as verified (after verify-email page success) */
    const markVerified = () => {
        if (user) setUser({ ...user, email_verified: true });
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading, resetUserPassword, resendVerification, markVerified }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
