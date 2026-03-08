import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/carService';
import StatsCard from '../components/StatsCard';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard()
            .then(data => setLeaderboard(data))
            .catch(err => console.error('Failed to load leaderboard:', err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="leaderboard-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏆</div>
                    Loading leaderboard...
                </div>
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);

    return (
        <div className="leaderboard-page">
            <div className="page-header">
                <h1>🥇 Leaderboard</h1>
                <p>Top car spotters ranked by rarity points</p>
            </div>

            {/* Podium */}
            {topThree.length > 0 && (
                <div className="podium animate-fade-in-up">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="podium-place second">
                            <div className="podium-avatar">{topThree[1].avatar}</div>
                            <div className="podium-medal">🥈</div>
                            <div className="podium-name">{topThree[1].username}</div>
                            <div className="podium-points">{topThree[1].totalRarityPoints} pts</div>
                            <div className="podium-bar" style={{ height: '120px' }}>
                                <span className="podium-rank">2</span>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                        <div className="podium-place first">
                            <div className="podium-crown">👑</div>
                            <div className="podium-avatar large">{topThree[0].avatar}</div>
                            <div className="podium-medal">🥇</div>
                            <div className="podium-name">{topThree[0].username}</div>
                            <div className="podium-points">{topThree[0].totalRarityPoints} pts</div>
                            <div className="podium-bar gold" style={{ height: '160px' }}>
                                <span className="podium-rank">1</span>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="podium-place third">
                            <div className="podium-avatar">{topThree[2].avatar}</div>
                            <div className="podium-medal">🥉</div>
                            <div className="podium-name">{topThree[2].username}</div>
                            <div className="podium-points">{topThree[2].totalRarityPoints} pts</div>
                            <div className="podium-bar" style={{ height: '90px' }}>
                                <span className="podium-rank">3</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
                <StatsCard icon="👥" label="Total Spotters" value={leaderboard.length} color="var(--accent-blue)" delay={0} />
                <StatsCard icon="📸" label="Total Spots" value={leaderboard.reduce((s, u) => s + u.totalSpots, 0)} color="var(--accent-green)" delay={1} />
                <StatsCard icon="⭐" label="Total Points" value={leaderboard.reduce((s, u) => s + u.totalRarityPoints, 0)} color="var(--accent-gold)" delay={2} />
            </div>

            {/* Full Rankings */}
            <div className="rankings animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="section-title">Full Rankings</h2>
                <div className="rankings-table">
                    <div className="rankings-header">
                        <span className="rank-col">#</span>
                        <span className="user-col">Spotter</span>
                        <span className="spots-col">Spots</span>
                        <span className="points-col">Points</span>
                        <span className="level-col">Level</span>
                    </div>
                    {leaderboard.map((user, index) => (
                        <div key={user.id} className={`rankings-row ${index < 3 ? 'top-three' : ''}`}>
                            <span className="rank-col">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                            </span>
                            <span className="user-col">
                                <span className="rank-avatar">{user.avatar}</span>
                                {user.username}
                            </span>
                            <span className="spots-col">{user.totalSpots}</span>
                            <span className="points-col" style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                                {user.totalRarityPoints}
                            </span>
                            <span className="level-col">LVL {user.level}</span>
                        </div>
                    ))}
                    {leaderboard.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            No spotters yet. Be the first!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
