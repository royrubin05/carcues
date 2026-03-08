import { useMemo } from 'react';
import StatsCard from '../components/StatsCard';
import './LeaderboardPage.css';

export default function LeaderboardPage() {
    const leaderboard = useMemo(() => {
        const users = JSON.parse(localStorage.getItem('carcues_users') || '[]');
        const allSpots = JSON.parse(localStorage.getItem('carcues_spots') || '{}');

        return users
            .filter(u => u.role !== 'admin')
            .map(user => {
                const spots = allSpots[user.id] || [];
                const totalRarityPoints = spots.reduce((sum, s) => sum + (s.car?.rarity || 0), 0);
                const rarestFind = spots.length > 0
                    ? spots.reduce((r, s) => (s.car?.rarity || 0) > (r.car?.rarity || 0) ? s : r, spots[0])
                    : null;
                return {
                    ...user,
                    totalSpots: spots.length,
                    totalRarityPoints,
                    rarestFind,
                    level: Math.floor(totalRarityPoints / 20) + 1,
                };
            })
            .sort((a, b) => b.totalRarityPoints - a.totalRarityPoints);
    }, []);

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

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
                        <span className="rarest-col">Rarest Find</span>
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
                            <span className="rarest-col">
                                {user.rarestFind
                                    ? `${user.rarestFind.car.make} ${user.rarestFind.car.model}`
                                    : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
