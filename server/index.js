import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import sql from './db.js';
import { sendPasswordResetEmail, sendNewUserNotification } from './email.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ══════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(36);
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

/** Middleware: require valid session token */
async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const sessions = await sql`
        SELECT s.*, u.id as user_id, u.username, u.email, u.role, u.avatar, u.joined_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${token} AND s.expires_at > NOW()
    `;
    if (sessions.length === 0) return res.status(401).json({ error: 'Invalid or expired session' });

    req.user = sessions[0];
    next();
}

/** Middleware: require admin role */
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
}

// ══════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required' });
        if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });
        if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

        // Check uniqueness
        const existing = await sql`
            SELECT id FROM users WHERE LOWER(username) = LOWER(${username}) OR LOWER(email) = LOWER(${email})
        `;
        if (existing.length > 0) return res.status(400).json({ error: 'Username or email already taken' });

        const avatars = ['🏎️', '🔧', '💨', '⚙️', '🏁', '🚗', '🛞', '🔑', '🚀', '💎'];
        const avatar = avatars[Math.floor(Math.random() * avatars.length)];

        const [user] = await sql`
            INSERT INTO users (username, email, role, avatar, password_hash)
            VALUES (${username}, ${email}, 'user', ${avatar}, ${simpleHash(password)})
            RETURNING id, username, email, role, avatar, joined_at
        `;

        // Create session
        const token = generateToken();
        await sql`INSERT INTO sessions (id, user_id) VALUES (${token}, ${user.id})`;

        // Notify admin of new registration (fire-and-forget)
        sendNewUserNotification(user).catch(() => { });

        res.json({ success: true, user, token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        const users = await sql`
            SELECT id, username, email, role, avatar, password_hash, joined_at
            FROM users WHERE username = ${username}
        `;
        if (users.length === 0) return res.status(401).json({ error: 'No account found with that username' });

        const user = users[0];
        if (user.password_hash !== simpleHash(password)) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Create session
        const token = generateToken();
        await sql`INSERT INTO sessions (id, user_id) VALUES (${token}, ${user.id})`;

        const { password_hash, ...safeUser } = user;
        res.json({ success: true, user: safeUser, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    await sql`DELETE FROM sessions WHERE id = ${token}`;
    res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
    const { password_hash, created_at, expires_at, ...user } = req.user;
    res.json({ user });
});

app.post('/api/auth/reset-password', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        if (!userId || !newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }

        await sql`UPDATE users SET password_hash = ${simpleHash(newPassword)} WHERE id = ${userId}`;
        // Invalidate user's sessions
        await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
        res.json({ success: true });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Forgot password — sends email with reset link
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Always return success to prevent email enumeration
        const users = await sql`SELECT id, email FROM users WHERE LOWER(email) = LOWER(${email})`;
        if (users.length === 0) return res.json({ success: true });

        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Store token
        await sql`INSERT INTO password_reset_tokens (user_id, token) VALUES (${user.id}, ${resetToken})`;

        // Determine base URL
        const baseUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://www.carcues.com';

        // Send email
        await sendPasswordResetEmail(user.email, resetToken, baseUrl);
        res.json({ success: true });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset password with token (from email link)
app.post('/api/auth/reset-password-token', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 4) {
            return res.status(400).json({ error: 'Valid token and password (4+ chars) required' });
        }

        const tokens = await sql`
            SELECT * FROM password_reset_tokens
            WHERE token = ${token} AND used = false AND expires_at > NOW()
        `;
        if (tokens.length === 0) return res.status(400).json({ error: 'Invalid or expired reset link' });

        const resetRecord = tokens[0];

        // Update password
        await sql`UPDATE users SET password_hash = ${simpleHash(newPassword)} WHERE id = ${resetRecord.user_id}`;
        // Mark token as used
        await sql`UPDATE password_reset_tokens SET used = true WHERE id = ${resetRecord.id}`;
        // Invalidate all sessions
        await sql`DELETE FROM sessions WHERE user_id = ${resetRecord.user_id}`;

        res.json({ success: true });
    } catch (err) {
        console.error('Reset with token error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ══════════════════════════════════════════════
// USERS ROUTES (admin only)
// ══════════════════════════════════════════════

app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await sql`
            SELECT id, username, email, role, avatar, joined_at FROM users ORDER BY joined_at DESC
        `;
        res.json({ users });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password are required' });
        if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
        if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });

        const existing = await sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${username}) OR LOWER(email) = LOWER(${email})`;
        if (existing.length > 0) return res.status(400).json({ error: 'Username or email already taken' });

        const avatars = ['🏎️', '🔧', '💨', '⚙️', '🏁', '🚗', '🛞', '🔑', '🚀', '💎'];
        const avatar = avatars[Math.floor(Math.random() * avatars.length)];
        const userRole = role === 'admin' ? 'admin' : 'user';

        const [user] = await sql`
            INSERT INTO users (username, email, role, avatar, password_hash)
            VALUES (${username}, ${email}, ${userRole}, ${avatar}, ${simpleHash(password)})
            RETURNING id, username, email, role, avatar, joined_at
        `;
        res.json({ success: true, user });
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        // Don't allow deleting yourself
        if (userId === req.user.user_id) return res.status(400).json({ error: 'Cannot delete your own account' });

        // Cascade: delete sessions, audit refs are SET NULL via FK
        await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
        await sql`DELETE FROM users WHERE id = ${userId}`;
        res.json({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ══════════════════════════════════════════════
// SPOTS ROUTES
// ══════════════════════════════════════════════

app.get('/api/spots', requireAuth, async (req, res) => {
    try {
        const spots = await sql`
            SELECT * FROM spots WHERE user_id = ${req.user.user_id} ORDER BY spotted_at DESC
        `;
        res.json({ spots: spots.map(formatSpot) });
    } catch (err) {
        console.error('Get spots error:', err);
        res.status(500).json({ error: 'Failed to fetch spots' });
    }
});

app.get('/api/spots/all', requireAuth, async (req, res) => {
    try {
        const spots = await sql`SELECT * FROM spots ORDER BY spotted_at DESC`;
        res.json({ spots: spots.map(formatSpot) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch all spots' });
    }
});

app.post('/api/spots', requireAuth, async (req, res) => {
    try {
        const { car, location, source } = req.body;
        const [spot] = await sql`
            INSERT INTO spots (user_id, car_make, car_model, car_year, car_category, car_rarity, car_image,
                location_lat, location_lng, location_city, location_country, source)
            VALUES (${req.user.user_id}, ${car.make}, ${car.model}, ${car.year || null}, ${car.category || 'Car'},
                ${car.rarity || 15}, ${car.image || null},
                ${location?.lat || null}, ${location?.lng || null}, ${location?.city || null}, ${location?.country || null},
                ${source || 'gemini'})
            RETURNING *
        `;
        res.json({ success: true, spot: formatSpot(spot) });
    } catch (err) {
        console.error('Add spot error:', err);
        res.status(500).json({ error: 'Failed to save spot' });
    }
});

app.delete('/api/spots/:id', requireAuth, async (req, res) => {
    try {
        await sql`DELETE FROM spots WHERE id = ${req.params.id} AND user_id = ${req.user.user_id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete spot' });
    }
});

// Toggle star on a spot (max 6 starred)
app.patch('/api/spots/:id/star', requireAuth, async (req, res) => {
    try {
        const spotId = req.params.id;
        const userId = req.user.user_id;

        // Verify ownership
        const [spot] = await sql`SELECT id, starred FROM spots WHERE id = ${spotId} AND user_id = ${userId}`;
        if (!spot) return res.status(404).json({ error: 'Spot not found' });

        const newStarred = !spot.starred;

        // If starring, check max 6
        if (newStarred) {
            const [countRow] = await sql`SELECT COUNT(*) as count FROM spots WHERE user_id = ${userId} AND starred = true`;
            if (parseInt(countRow.count) >= 6) {
                return res.status(400).json({ error: 'You can star up to 6 cars' });
            }
        }

        await sql`UPDATE spots SET starred = ${newStarred} WHERE id = ${spotId}`;
        res.json({ success: true, starred: newStarred });
    } catch (err) {
        console.error('Star toggle error:', err);
        res.status(500).json({ error: 'Failed to toggle star' });
    }
});

function formatSpot(row) {
    return {
        id: row.id,
        car: {
            make: row.car_make,
            model: row.car_model,
            year: row.car_year,
            category: row.car_category,
            rarity: row.car_rarity,
            image: row.car_image,
        },
        location: row.location_lat ? {
            lat: row.location_lat,
            lng: row.location_lng,
            city: row.location_city,
            country: row.location_country,
        } : null,
        source: row.source,
        spottedAt: row.spotted_at,
        starred: row.starred || false,
    };
}

// ══════════════════════════════════════════════
// WISHLIST ROUTES
// ══════════════════════════════════════════════

app.get('/api/wishlist', requireAuth, async (req, res) => {
    try {
        const items = await sql`
            SELECT * FROM wishlist WHERE user_id = ${req.user.user_id} ORDER BY added_at DESC
        `;
        res.json({ wishlist: items.map(w => ({ id: w.id, ...w.car_data, addedAt: w.added_at })) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

app.post('/api/wishlist', requireAuth, async (req, res) => {
    try {
        const { car } = req.body;
        const [item] = await sql`
            INSERT INTO wishlist (user_id, car_data)
            VALUES (${req.user.user_id}, ${JSON.stringify(car)})
            ON CONFLICT (user_id, car_data) DO NOTHING
            RETURNING *
        `;
        res.json({ success: true, item });
    } catch (err) {
        console.error('Add wishlist error:', err);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

app.delete('/api/wishlist/:id', requireAuth, async (req, res) => {
    try {
        await sql`DELETE FROM wishlist WHERE id = ${req.params.id} AND user_id = ${req.user.user_id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// ══════════════════════════════════════════════
// STATS ROUTE
// ══════════════════════════════════════════════

app.get('/api/stats', requireAuth, async (req, res) => {
    try {
        const spots = await sql`SELECT * FROM spots WHERE user_id = ${req.user.user_id}`;
        const wishlist = await sql`SELECT * FROM wishlist WHERE user_id = ${req.user.user_id}`;

        const totalRarityPoints = spots.reduce((sum, s) => sum + (s.car_rarity || 0), 0);
        const uniqueMakes = new Set(spots.map(s => s.car_make).filter(Boolean));
        const rarestSpot = spots.length > 0
            ? spots.reduce((r, s) => (s.car_rarity || 0) > (r.car_rarity || 0) ? s : r, spots[0])
            : null;

        res.json({
            totalSpots: spots.length,
            totalRarityPoints: Math.round(totalRarityPoints),
            uniqueMakes: uniqueMakes.size,
            averageRarity: spots.length > 0 ? (totalRarityPoints / spots.length).toFixed(1) : 0,
            level: Math.floor(totalRarityPoints / 200) + 1,
            xpProgress: ((totalRarityPoints % 200) / 200) * 100,
            wishlistCount: wishlist.length,
            rarestFind: rarestSpot ? formatSpot(rarestSpot) : null,
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ══════════════════════════════════════════════
// LEADERBOARD ROUTE
// ══════════════════════════════════════════════

app.get('/api/leaderboard', requireAuth, async (req, res) => {
    try {
        const users = await sql`
            SELECT u.id, u.username, u.avatar, u.role,
                COUNT(s.id) as total_spots,
                COALESCE(SUM(s.car_rarity), 0) as total_rarity_points
            FROM users u
            LEFT JOIN spots s ON u.id = s.user_id
            WHERE u.role != 'admin'
            GROUP BY u.id
            ORDER BY total_rarity_points DESC
        `;

        const leaderboard = users.map(u => ({
            id: u.id,
            username: u.username,
            avatar: u.avatar,
            totalSpots: parseInt(u.total_spots),
            totalRarityPoints: Math.round(parseFloat(u.total_rarity_points)),
            level: Math.floor(parseFloat(u.total_rarity_points) / 20) + 1,
        }));

        res.json({ leaderboard });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// ══════════════════════════════════════════════
// AUDIT ROUTES
// ══════════════════════════════════════════════

app.get('/api/audit', requireAuth, requireAdmin, async (req, res) => {
    try {
        const log = await sql`SELECT * FROM audit_log ORDER BY created_at DESC`;
        const total = log.length;
        const overridden = log.filter(e => e.was_overridden).length;
        const accurate = total - overridden;
        const accuracyRate = total > 0 ? Math.round((accurate / total) * 100) : 0;

        const highConf = log.filter(e => e.confidence >= 80);
        const lowConf = log.filter(e => e.confidence < 80);
        const highConfAccurate = highConf.filter(e => !e.was_overridden).length;
        const lowConfAccurate = lowConf.filter(e => !e.was_overridden).length;

        // Top overridden makes
        const overriddenMakes = {};
        log.filter(e => e.was_overridden).forEach(e => {
            const make = e.ai_prediction?.make || 'Unknown';
            overriddenMakes[make] = (overriddenMakes[make] || 0) + 1;
        });

        res.json({
            log: log.map(e => ({
                id: e.id,
                userId: e.user_id,
                timestamp: e.created_at,
                aiPrediction: e.ai_prediction,
                userFinal: e.user_final,
                confidence: e.confidence,
                source: e.source,
                wasOverridden: e.was_overridden,
            })),
            stats: {
                total, accurate, overridden, accuracyRate,
                highConfTotal: highConf.length,
                highConfAccurate,
                highConfRate: highConf.length > 0 ? Math.round((highConfAccurate / highConf.length) * 100) : 0,
                lowConfTotal: lowConf.length,
                lowConfAccurate,
                lowConfRate: lowConf.length > 0 ? Math.round((lowConfAccurate / lowConf.length) * 100) : 0,
                topOverriddenMakes: Object.entries(overriddenMakes).sort((a, b) => b[1] - a[1]).slice(0, 5),
            },
        });
    } catch (err) {
        console.error('Get audit error:', err);
        res.status(500).json({ error: 'Failed to fetch audit log' });
    }
});

app.post('/api/audit', requireAuth, async (req, res) => {
    try {
        const { aiPrediction, userFinal, confidence, source, wasOverridden } = req.body;
        await sql`
            INSERT INTO audit_log (user_id, ai_prediction, user_final, confidence, source, was_overridden)
            VALUES (${req.user.user_id}, ${JSON.stringify(aiPrediction)}, ${JSON.stringify(userFinal)},
                ${confidence}, ${source}, ${wasOverridden})
        `;
        res.json({ success: true });
    } catch (err) {
        console.error('Log audit error:', err);
        res.status(500).json({ error: 'Failed to log audit entry' });
    }
});

app.delete('/api/audit', requireAuth, requireAdmin, async (req, res) => {
    try {
        await sql`DELETE FROM audit_log`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to clear audit log' });
    }
});

// ══════════════════════════════════════════════
// ADMIN PLATFORM STATS
// ══════════════════════════════════════════════

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const [userCount] = await sql`SELECT COUNT(*) as count FROM users`;
        const [spotCount] = await sql`SELECT COUNT(*) as count FROM spots`;
        const [wishlistCount] = await sql`SELECT COUNT(*) as count FROM wishlist`;
        const [raritySum] = await sql`SELECT COALESCE(SUM(car_rarity), 0) as total FROM spots`;

        res.json({
            totalUsers: parseInt(userCount.count),
            totalSpots: parseInt(spotCount.count),
            totalWishlist: parseInt(wishlistCount.count),
            totalPoints: Math.round(parseFloat(raritySum.total)),
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

app.get('/api/admin/spots', requireAuth, requireAdmin, async (req, res) => {
    try {
        const spots = await sql`
            SELECT s.*, u.username, u.avatar
            FROM spots s JOIN users u ON s.user_id = u.id
            ORDER BY s.spotted_at DESC
        `;
        res.json({
            spots: spots.map(s => ({
                ...formatSpot(s),
                spotter: { username: s.username, avatar: s.avatar },
            })),
        });
    } catch (err) {
        console.error('Admin spots error:', err);
        res.status(500).json({ error: 'Failed to fetch spots' });
    }
});

// ══════════════════════════════════════════════
// PUBLIC ROUTES (no auth — for sharing)
// ══════════════════════════════════════════════

// Public spot page
app.get('/api/public/spot/:id', async (req, res) => {
    try {
        const [spot] = await sql`
            SELECT s.*, u.username, u.avatar
            FROM spots s JOIN users u ON s.user_id = u.id
            WHERE s.id = ${req.params.id}
        `;
        if (!spot) return res.status(404).json({ error: 'Spot not found' });
        res.json({
            spot: {
                ...formatSpot(spot),
                spotter: { username: spot.username, avatar: spot.avatar },
            },
        });
    } catch (err) {
        console.error('Public spot error:', err);
        res.status(500).json({ error: 'Failed to fetch spot' });
    }
});
// Public users list / search
app.get('/api/public/users', async (req, res) => {
    try {
        const q = req.query.q || '';
        let users;
        if (q) {
            users = await sql`
                SELECT u.id, u.username, u.avatar, u.joined_at,
                    COUNT(s.id) as spot_count,
                    COALESCE(SUM(s.car_rarity), 0) as total_rarity
                FROM users u
                LEFT JOIN spots s ON s.user_id = u.id
                WHERE u.role != 'admin' AND LOWER(u.username) LIKE LOWER(${`%${q}%`})
                GROUP BY u.id
                ORDER BY total_rarity DESC
            `;
        } else {
            users = await sql`
                SELECT u.id, u.username, u.avatar, u.joined_at,
                    COUNT(s.id) as spot_count,
                    COALESCE(SUM(s.car_rarity), 0) as total_rarity
                FROM users u
                LEFT JOIN spots s ON s.user_id = u.id
                WHERE u.role != 'admin'
                GROUP BY u.id
                ORDER BY total_rarity DESC
            `;
        }

        // Get top starred car for each user
        const userIds = users.map(u => u.id);
        let starredMap = {};
        if (userIds.length > 0) {
            const starredSpots = await sql`
                SELECT DISTINCT ON (user_id) user_id, car_make, car_model, car_rarity, car_image
                FROM spots
                WHERE user_id = ANY(${userIds}) AND starred = true
                ORDER BY user_id, car_rarity DESC
            `;
            starredSpots.forEach(s => {
                starredMap[s.user_id] = { make: s.car_make, model: s.car_model, rarity: s.car_rarity, image: s.car_image };
            });
        }

        res.json({
            users: users.map(u => ({
                username: u.username,
                avatar: u.avatar,
                joinedAt: u.joined_at,
                spotCount: parseInt(u.spot_count),
                totalRarity: Math.round(parseFloat(u.total_rarity)),
                level: Math.floor(parseFloat(u.total_rarity) / 200) + 1,
                topStarred: starredMap[u.id] || null,
            })),
        });
    } catch (err) {
        console.error('Public users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Public profile (showcase)
app.get('/api/public/profile/:username', async (req, res) => {
    try {
        const [user] = await sql`
            SELECT id, username, avatar, joined_at FROM users WHERE LOWER(username) = LOWER(${req.params.username})
        `;
        if (!user) return res.status(404).json({ error: 'User not found' });

        const spots = await sql`
            SELECT * FROM spots WHERE user_id = ${user.id}
            ORDER BY starred DESC, car_rarity DESC
        `;
        const [countRow] = await sql`SELECT COUNT(*) as total FROM spots WHERE user_id = ${user.id}`;
        const [rarityRow] = await sql`SELECT COALESCE(SUM(car_rarity), 0) as total FROM spots WHERE user_id = ${user.id}`;
        const [makesRow] = await sql`SELECT COUNT(DISTINCT car_make) as total FROM spots WHERE user_id = ${user.id}`;

        const totalPoints = Math.round(parseFloat(rarityRow.total));
        const formattedSpots = spots.map(formatSpot);
        const rarestSpot = formattedSpots.length > 0 ? formattedSpots.reduce((a, b) => a.car.rarity > b.car.rarity ? a : b) : null;

        res.json({
            profile: {
                username: user.username,
                avatar: user.avatar,
                joinedAt: user.joined_at,
                totalSpots: parseInt(countRow.total),
                totalRarityPoints: totalPoints,
                level: Math.floor(totalPoints / 200) + 1,
                uniqueMakes: parseInt(makesRow.total),
                rarestFind: rarestSpot ? { name: `${rarestSpot.car.make} ${rarestSpot.car.model}`, rarity: rarestSpot.car.rarity } : null,
                spots: formattedSpots,
            },
        });
    } catch (err) {
        console.error('Public profile error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Spot of the Day
app.get('/api/public/spot-of-the-day', async (req, res) => {
    try {
        // Try today's highest rarity spot
        let [spot] = await sql`
            SELECT s.*, u.username, u.avatar
            FROM spots s JOIN users u ON s.user_id = u.id
            WHERE s.spotted_at >= CURRENT_DATE
            ORDER BY s.car_rarity DESC LIMIT 1
        `;
        // Fallback: most recent high-rarity spot ever
        if (!spot) {
            [spot] = await sql`
                SELECT s.*, u.username, u.avatar
                FROM spots s JOIN users u ON s.user_id = u.id
                ORDER BY s.car_rarity DESC LIMIT 1
            `;
        }
        if (!spot) return res.json({ spotOfTheDay: null });
        res.json({
            spotOfTheDay: {
                ...formatSpot(spot),
                spotter: { username: spot.username, avatar: spot.avatar },
            },
        });
    } catch (err) {
        console.error('Spot of the day error:', err);
        res.status(500).json({ error: 'Failed to fetch spot of the day' });
    }
});

// ══════════════════════════════════════════════
// Start server
// ══════════════════════════════════════════════

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 CarCues API server running on http://localhost:${PORT}`);
});

export default app;
