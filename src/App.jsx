import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import CollectionPage from './pages/CollectionPage';
// import MapPage from './pages/MapPage'; // Temporarily disabled
import WishlistPage from './pages/WishlistPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ProfilePage from './pages/ProfilePage';
import PublicSpotPage from './pages/PublicSpotPage';
import ShowcasePage from './pages/ShowcasePage';
import ExplorePage from './pages/ExplorePage';
import SpotOfTheDayPage from './pages/SpotOfTheDayPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public pages (no login required) */}
                    <Route path="/spot/:id" element={<PublicSpotPage />} />
                    <Route path="/u/:username" element={<ShowcasePage />} />
                    <Route path="/spot-of-the-day" element={<SpotOfTheDayPage />} />

                    {/* Auth pages */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected pages */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/collection" element={<CollectionPage />} />
                        {/* <Route path="/map" element={<MapPage />} /> */}
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/leaderboard" element={<LeaderboardPage />} />
                        <Route path="/how-it-works" element={<HowItWorksPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/explore" element={<ExplorePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
