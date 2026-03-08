import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import CollectionPage from './pages/CollectionPage';
// import MapPage from './pages/MapPage'; // Temporarily disabled
import WishlistPage from './pages/WishlistPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PublicSpotPage from './pages/PublicSpotPage';
import PublicProfilePage from './pages/PublicProfilePage';
import SpotOfTheDayPage from './pages/SpotOfTheDayPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public pages (no login required) */}
                    <Route path="/spot/:id" element={<PublicSpotPage />} />
                    <Route path="/u/:username" element={<PublicProfilePage />} />
                    <Route path="/spot-of-the-day" element={<SpotOfTheDayPage />} />

                    {/* Auth pages */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Protected pages */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/collection" element={<CollectionPage />} />
                        {/* <Route path="/map" element={<MapPage />} /> */}
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/how-it-works" element={<HowItWorksPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
