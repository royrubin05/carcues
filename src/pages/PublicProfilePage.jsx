import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRarityTier } from '../data/mockData';
import RarityBadge from '../components/RarityBadge';
import ShareButton from '../components/ShareButton';
import { PublicNav } from './PublicSpotPage';
import './PublicPages.css';

export default function PublicProfilePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch(`/api/public/profile/${username}`)
            .then(r => r.json())
            .then(data => {
                if (data.profile) setProfile(data.profile);
                else setError(true);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [username]);

    if (loading) return <div className="public-page"><div className="public-loading">Loading profile...</div></div>;
    if (error || !profile) return (
        <div className="public-page">
            <PublicNav />
            <div className="public-not-found">
                <h2>User not found</h2>
                <p>This profile doesn't exist.</p>
            </div>
        </div>
    );

    return (
        <div className="public-page">
            <PublicNav />
            <div className="public-profile-hero animate-fade-in-up">
                <div className="public-profile-header">
                    <div className="public-profile-avatar">{profile.avatar}</div>
                    <h1 className="public-profile-name">{profile.username}</h1>
                    <p className="public-profile-joined">
                        Member since {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <div className="public-profile-stats">
                        <div className="public-profile-stat">
                            <div className="public-profile-stat-value">{profile.totalSpots}</div>
                            <div className="public-profile-stat-label">Spots</div>
                        </div>
                        <div className="public-profile-stat">
                            <div className="public-profile-stat-value">{profile.totalRarityPoints}</div>
                            <div className="public-profile-stat-label">Points</div>
                        </div>
                        <div className="public-profile-stat">
                            <div className="public-profile-stat-value">LVL {profile.level}</div>
                            <div className="public-profile-stat-label">Level</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <ShareButton url={window.location.href} text={`Check out ${profile.username}'s car collection on CarCues!`} />
                    </div>
                </div>

                {profile.topSpots.length > 0 && (
                    <>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '24px 0 12px' }}>🏆 Top Rarest Finds</h2>
                        <div className="public-profile-spots">
                            {profile.topSpots.map(spot => {
                                const tier = getRarityTier(spot.car.rarity);
                                return (
                                    <Link to={`/spot/${spot.id}`} key={spot.id} className="public-profile-spot-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        {spot.car.image && <img src={spot.car.image} alt={spot.car.model} className="public-profile-spot-img" />}
                                        <div className="public-profile-spot-info">
                                            <div className="public-profile-spot-name">{spot.car.make} {spot.car.model}</div>
                                            <div className="public-profile-spot-rarity" style={{ color: tier.color }}>
                                                {tier.name} · {spot.car.rarity}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
