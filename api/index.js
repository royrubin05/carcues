import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const sql = neon(process.env.DATABASE_URL);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'CarCues <no-reply@carcues.com>';

function verificationEmailHtml(username, verifyUrl) {
    return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:36px;background:#0f0f1a;color:#e0e0e8;border-radius:16px;"><div style="text-align:center;margin-bottom:28px;"><h1 style="color:#0ea5e9;font-size:28px;margin:0;">CarCues</h1><p style="color:#888;margin:6px 0 0;font-size:14px;">Spot Rare Cars. Build Your Collection.</p></div><h2 style="color:#e0e0e8;font-size:20px;margin:0 0 12px;">Welcome to CarCues, ${username}! 🏎️</h2><p style="color:#b0b0c0;font-size:15px;line-height:1.7;margin:0 0 16px;">Thanks for signing up! Before you can start spotting and collecting cars, we need to verify that this email address belongs to you.</p><p style="color:#b0b0c0;font-size:15px;line-height:1.7;margin:0 0 20px;"><strong style="color:#e0e0e8;">Click the button below</strong> to verify your email. Once verified, you'll be able to log in and access your CarCues dashboard.</p><div style="text-align:center;margin:32px 0;"><a href="${verifyUrl}" style="background:#0ea5e9;color:white;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;letter-spacing:0.3px;">✅ Verify My Email</a></div><div style="background:#1a1a2e;border-radius:12px;padding:20px;margin:24px 0;"><p style="color:#888;font-size:13px;margin:0 0 12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">How it works:</p><p style="color:#b0b0c0;font-size:14px;line-height:1.6;margin:0 0 8px;"><span style="color:#0ea5e9;font-weight:600;">Step 1:</span> Click the "Verify My Email" button above</p><p style="color:#b0b0c0;font-size:14px;line-height:1.6;margin:0 0 8px;"><span style="color:#0ea5e9;font-weight:600;">Step 2:</span> You'll see a confirmation page that your email is verified</p><p style="color:#b0b0c0;font-size:14px;line-height:1.6;margin:0;"><span style="color:#0ea5e9;font-weight:600;">Step 3:</span> Head to CarCues, log in, and start spotting rare cars!</p></div><p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 8px;">⏰ This link expires in <strong>24 hours</strong>. If it expires, you can request a new one from the login page.</p><p style="color:#666;font-size:12px;line-height:1.5;margin:16px 0 0;">If you didn't create a CarCues account, you can safely ignore this email — no action is needed.</p><hr style="border:none;border-top:1px solid #2a2a3d;margin:24px 0;"/><p style="color:#555;font-size:11px;text-align:center;margin:0;">CarCues — Spot Rare Cars. Build Your Collection. Climb the Leaderboard.</p></div>`;
}

function passedEmailHtml(passedUsername, passerUsername) {
    return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:36px;background:#0f0f1a;color:#e0e0e8;border-radius:16px;"><div style="text-align:center;margin-bottom:28px;"><h1 style="color:#0ea5e9;font-size:28px;margin:0;">CarCues</h1><p style="color:#888;margin:6px 0 0;font-size:14px;">Spot Rare Cars. Build Your Collection.</p></div><div style="text-align:center;font-size:3rem;margin-bottom:16px;">🏁</div><h2 style="color:#f59e0b;font-size:20px;margin:0 0 16px;text-align:center;">You've been passed!</h2><p style="color:#b0b0c0;font-size:15px;line-height:1.7;margin:0 0 16px;text-align:center;"><strong style="color:#e0e0e8;">${passerUsername}</strong> just overtook you on the CarCues leaderboard!</p><div style="background:#1a1a2e;border-radius:12px;padding:20px;margin:24px 0;text-align:center;"><p style="color:#b0b0c0;font-size:15px;line-height:1.7;margin:0;">Don't let them get away with it, <strong style="color:#e0e0e8;">${passedUsername}</strong>! 🏎️<br/>Get back out there and spot some cool cars to reclaim your spot!</p></div><div style="text-align:center;margin:32px 0;"><a href="https://www.carcues.com/leaderboard" style="background:#0ea5e9;color:white;padding:16px 40px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;letter-spacing:0.3px;">📊 View Leaderboard</a></div><hr style="border:none;border-top:1px solid #2a2a3d;margin:24px 0;"/><p style="color:#555;font-size:11px;text-align:center;margin:0;">CarCues — Spot Rare Cars. Build Your Collection. Climb the Leaderboard.</p></div>`;
}

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

async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const sessions = await sql`
        SELECT s.*, u.id as user_id, u.username, u.email, u.role, u.avatar, u.joined_at, u.email_verified
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ${token} AND s.expires_at > NOW()
    `;
    if (sessions.length === 0) return res.status(401).json({ error: 'Invalid or expired session' });
    req.user = sessions[0];
    next();
}

function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
}

function formatSpot(row) {
    return {
        id: row.id,
        car: {
            make: row.car_make, model: row.car_model, year: row.car_year,
            category: row.car_category, rarity: row.car_rarity, image: row.car_image,
        },
        location: row.location_lat ? {
            lat: row.location_lat, lng: row.location_lng, city: row.location_city, country: row.location_country,
        } : null,
        source: row.source,
        spottedAt: row.spotted_at,
        starred: row.starred || false,
    };
}

// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required' });
        if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' });


        const existing = await sql`SELECT id FROM users WHERE LOWER(username) = LOWER(${username}) OR LOWER(email) = LOWER(${email})`;
        if (existing.length > 0) return res.status(400).json({ error: 'Username or email already taken' });

        const avatars = ['🏎️', '🔧', '💨', '⚙️', '🏁', '🚗', '🛞', '🔑', '🚀', '💎'];
        const avatar = avatars[Math.floor(Math.random() * avatars.length)];

        const [user] = await sql`
            INSERT INTO users (username, email, role, avatar, password_hash, email_verified)
            VALUES (${username}, ${email}, 'user', ${avatar}, ${simpleHash(password)}, false)
            RETURNING id, username, email, role, avatar, joined_at, email_verified
        `;

        // Generate verification token & send email
        const verifyToken = crypto.randomBytes(32).toString('hex');
        await sql`INSERT INTO email_verification_tokens (user_id, token) VALUES (${user.id}, ${verifyToken})`;
        const baseUrl = 'https://www.carcues.com';
        try {
            const emailResult = await resend.emails.send({
                from: FROM_EMAIL, to: user.email,
                bcc: 'j09rubin@gmail.com',
                subject: '📧 CarCues — Verify your email to get started',
                html: verificationEmailHtml(user.username, `${baseUrl}/verify-email?token=${verifyToken}`)
            });
            if (emailResult.error) {
                console.error('❌ Resend returned error:', JSON.stringify(emailResult.error));
            } else {
                console.log('✅ Verification email sent to', user.email, 'id:', emailResult.data?.id);
            }
        } catch (emailErr) {
            console.error('❌ Failed to send verification email:', emailErr);
        }

        // Notify admin of new registration (fire-and-forget)
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
            resend.emails.send({
                from: FROM_EMAIL, to: adminEmail,
                subject: `\uD83C\uDD95 New CarCues User: ${user.username}`,
                html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f0f1a;color:#e0e0e8;border-radius:16px;"><h1 style="color:#0ea5e9;">CarCues</h1><p>New user registered:</p><div style="background:#1a1a2e;padding:20px;border-radius:12px;"><p><strong>Username:</strong> ${user.username}</p><p><strong>Email:</strong> ${user.email}</p><p><strong>Avatar:</strong> ${user.avatar}</p></div></div>`
            }).catch(() => { });
        }
        // Do NOT create session — user must verify email first
        res.json({ success: true, needsVerification: true, message: 'Account created! Please check your email to verify your account.' });
    } catch (err) { console.error('Register error:', err); res.status(500).json({ error: 'Registration failed' }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
        const users = await sql`SELECT id, username, email, role, avatar, password_hash, joined_at, email_verified FROM users WHERE username = ${username}`;
        if (users.length === 0) return res.status(401).json({ error: 'No account found with that username' });
        const user = users[0];
        if (user.password_hash !== simpleHash(password)) return res.status(401).json({ error: 'Incorrect password' });
        if (!user.email_verified) return res.status(403).json({ error: 'Please verify your email before logging in. Check your inbox for a verification link.', needsVerification: true });
        const token = generateToken();
        await sql`INSERT INTO sessions (id, user_id) VALUES (${token}, ${user.id})`;
        const { password_hash, ...safeUser } = user;
        res.json({ success: true, user: safeUser, token });
    } catch (err) { console.error('Login error:', err); res.status(500).json({ error: 'Login failed' }); }
});

// ── Email verification ──
app.get('/api/auth/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token is required' });
        const tokens = await sql`SELECT * FROM email_verification_tokens WHERE token = ${token}`;
        if (tokens.length === 0) return res.status(400).json({ error: 'Invalid verification link' });
        const record = tokens[0];
        if (record.used) {
            const [user] = await sql`SELECT id, username, email, role, avatar, joined_at, email_verified FROM users WHERE id = ${record.user_id}`;
            const sessionToken = generateToken();
            await sql`INSERT INTO sessions (id, user_id) VALUES (${sessionToken}, ${user.id})`;
            return res.json({ success: true, message: 'Email already verified', user, token: sessionToken });
        }
        if (new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
        }
        await sql`UPDATE users SET email_verified = true, email_verified_at = NOW() WHERE id = ${record.user_id}`;
        await sql`UPDATE email_verification_tokens SET used = true WHERE id = ${record.id}`;
        const [user] = await sql`SELECT id, username, email, role, avatar, joined_at, email_verified FROM users WHERE id = ${record.user_id}`;
        const sessionToken = generateToken();
        await sql`INSERT INTO sessions (id, user_id) VALUES (${sessionToken}, ${user.id})`;
        res.json({ success: true, message: 'Email verified successfully!', user, token: sessionToken });
    } catch (err) { console.error('Verify email error:', err); res.status(500).json({ error: 'Verification failed' }); }
});

app.post('/api/auth/resend-verification', requireAuth, async (req, res) => {
    try {
        const [user] = await sql`SELECT id, email, username, email_verified FROM users WHERE id = ${req.user.id}`;
        if (user.email_verified) return res.json({ success: true, message: 'Email already verified' });
        const recent = await sql`SELECT created_at FROM email_verification_tokens WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1`;
        if (recent.length > 0) {
            const diff = Date.now() - new Date(recent[0].created_at).getTime();
            if (diff < 60000) return res.status(429).json({ error: `Please wait ${Math.ceil((60000 - diff) / 1000)} seconds` });
        }
        await sql`UPDATE email_verification_tokens SET used = true WHERE user_id = ${user.id} AND used = false`;
        const verifyToken = crypto.randomBytes(32).toString('hex');
        await sql`INSERT INTO email_verification_tokens (user_id, token) VALUES (${user.id}, ${verifyToken})`;
        const baseUrl = 'https://www.carcues.com';
        await resend.emails.send({
            from: FROM_EMAIL, to: user.email,
            bcc: 'j09rubin@gmail.com',
            subject: '📧 CarCues — Verify your email to get started',
            html: verificationEmailHtml(user.username, `${baseUrl}/verify-email?token=${verifyToken}`)
        });
        res.json({ success: true, message: 'Verification email sent!' });
    } catch (err) { console.error('Resend verification error:', err); res.status(500).json({ error: 'Failed to resend' }); }
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
        if (!userId || !newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
        await sql`UPDATE users SET password_hash = ${simpleHash(newPassword)} WHERE id = ${userId}`;
        await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to reset password' }); }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });
        const users = await sql`SELECT id, email FROM users WHERE LOWER(email) = LOWER(${email})`;
        if (users.length === 0) return res.json({ success: true });
        const user = users[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        await sql`INSERT INTO password_reset_tokens (user_id, token) VALUES (${user.id}, ${resetToken})`;
        const baseUrl = req.headers.origin || 'https://www.carcues.com';
        await resend.emails.send({
            from: FROM_EMAIL, to: user.email,
            subject: '\uD83D\uDD11 CarCues \u2014 Reset Your Password',
            html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0f0f1a;color:#e0e0e8;border-radius:16px;"><h1 style="color:#0ea5e9;">CarCues</h1><p>Click below to reset your password:</p><div style="text-align:center;margin:28px 0;"><a href="${baseUrl}/reset-password?token=${resetToken}" style="background:#0ea5e9;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block;">Reset Password</a></div><p style="color:#888;font-size:13px;">This link expires in 1 hour.</p></div>`
        });
        res.json({ success: true });
    } catch (err) { console.error('Forgot password error:', err); res.status(500).json({ error: 'Failed to process request' }); }
});

app.post('/api/auth/reset-password-token', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword || newPassword.length < 4) return res.status(400).json({ error: 'Valid token and password (4+ chars) required' });
        const tokens = await sql`SELECT * FROM password_reset_tokens WHERE token = ${token} AND used = false AND expires_at > NOW()`;
        if (tokens.length === 0) return res.status(400).json({ error: 'Invalid or expired reset link' });
        const resetRecord = tokens[0];
        await sql`UPDATE users SET password_hash = ${simpleHash(newPassword)} WHERE id = ${resetRecord.user_id}`;
        await sql`UPDATE password_reset_tokens SET used = true WHERE id = ${resetRecord.id}`;
        await sql`DELETE FROM sessions WHERE user_id = ${resetRecord.user_id}`;
        res.json({ success: true });
    } catch (err) { console.error('Reset with token error:', err); res.status(500).json({ error: 'Failed to reset password' }); }
});

// ══════════════════════════════════════════════
// USERS (admin)
// ══════════════════════════════════════════════

app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    const users = await sql`SELECT id, username, email, role, avatar, joined_at FROM users ORDER BY joined_at DESC`;
    res.json({ users });
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
            INSERT INTO users (username, email, role, avatar, password_hash, email_verified)
            VALUES (${username}, ${email}, ${userRole}, ${avatar}, ${simpleHash(password)}, true)
            RETURNING id, username, email, role, avatar, joined_at, email_verified
        `;
        res.json({ success: true, user });
    } catch (err) { console.error('Create user error:', err); res.status(500).json({ error: 'Failed to create user' }); }
});

app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (userId === req.user.user_id) return res.status(400).json({ error: 'Cannot delete your own account' });
        await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
        await sql`DELETE FROM users WHERE id = ${userId}`;
        res.json({ success: true });
    } catch (err) { console.error('Delete user error:', err); res.status(500).json({ error: 'Failed to delete user' }); }
});

// ══════════════════════════════════════════════
// SPOTS
// ══════════════════════════════════════════════

app.get('/api/spots', requireAuth, async (req, res) => {
    const spots = await sql`SELECT * FROM spots WHERE user_id = ${req.user.user_id} ORDER BY spotted_at DESC`;
    res.json({ spots: spots.map(formatSpot) });
});

app.get('/api/spots/all', requireAuth, async (req, res) => {
    const spots = await sql`SELECT * FROM spots ORDER BY spotted_at DESC`;
    res.json({ spots: spots.map(formatSpot) });
});

app.post('/api/spots', requireAuth, async (req, res) => {
    try {
        const { car, location, source } = req.body;
        const userId = req.user.user_id;
        const spotRarity = car.rarity || 15;

        // 1. Get user's current total BEFORE this spot
        const [{ total: oldTotal }] = await sql`
            SELECT COALESCE(SUM(car_rarity), 0) as total FROM spots WHERE user_id = ${userId}`;

        // 2. Insert the new spot
        const [spot] = await sql`
            INSERT INTO spots (user_id, car_make, car_model, car_year, car_category, car_rarity, car_image,
                location_lat, location_lng, location_city, location_country, source)
            VALUES (${userId}, ${car.make}, ${car.model}, ${car.year || null}, ${car.category || 'Car'},
                ${spotRarity}, ${car.image || null},
                ${location?.lat || null}, ${location?.lng || null}, ${location?.city || null}, ${location?.country || null},
                ${source || 'gemini'})
            RETURNING *
        `;

        // 3. Calculate new total
        const newTotal = parseFloat(oldTotal) + spotRarity;

        // 4. Find users who were above oldTotal but are now below newTotal (passed!)
        const passedUsers = await sql`
            SELECT u.id, u.username, u.email, u.avatar, u.email_verified,
                   COALESCE(SUM(s.car_rarity), 0) as total_points
            FROM users u
            LEFT JOIN spots s ON s.user_id = u.id
            WHERE u.id != ${userId} AND u.role != 'admin'
            GROUP BY u.id
            HAVING COALESCE(SUM(s.car_rarity), 0) >= ${parseFloat(oldTotal)}
               AND COALESCE(SUM(s.car_rarity), 0) < ${newTotal}
        `;

        // 5. Get current user's username for the email
        const [currentUser] = await sql`SELECT username FROM users WHERE id = ${userId}`;

        // 6. Fire-and-forget emails to passed users (only verified)
        for (const passed of passedUsers) {
            if (!passed.email_verified || !passed.email) continue;
            resend.emails.send({
                from: FROM_EMAIL,
                to: passed.email,
                bcc: 'j09rubin@gmail.com',
                subject: `🏁 ${currentUser.username} just passed you on CarCues!`,
                html: passedEmailHtml(passed.username, currentUser.username),
            }).catch(err => console.error('Failed to send passing email:', err));
        }

        res.json({
            success: true,
            spot: formatSpot(spot),
            passedUsers: passedUsers.map(u => ({ username: u.username, avatar: u.avatar })),
        });
    } catch (err) { console.error('Add spot error:', err); res.status(500).json({ error: 'Failed to save spot' }); }
});

app.delete('/api/spots/:id', requireAuth, async (req, res) => {
    await sql`DELETE FROM spots WHERE id = ${req.params.id} AND user_id = ${req.user.user_id}`;
    res.json({ success: true });
});

app.patch('/api/spots/:id/star', requireAuth, async (req, res) => {
    try {
        const spotId = req.params.id;
        const userId = req.user.user_id;
        const [spot] = await sql`SELECT id, starred FROM spots WHERE id = ${spotId} AND user_id = ${userId}`;
        if (!spot) return res.status(404).json({ error: 'Spot not found' });
        const newStarred = !spot.starred;
        if (newStarred) {
            const [countRow] = await sql`SELECT COUNT(*) as count FROM spots WHERE user_id = ${userId} AND starred = true`;
            if (parseInt(countRow.count) >= 6) return res.status(400).json({ error: 'You can star up to 6 cars' });
        }
        await sql`UPDATE spots SET starred = ${newStarred} WHERE id = ${spotId}`;
        res.json({ success: true, starred: newStarred });
    } catch (err) { res.status(500).json({ error: 'Failed to toggle star' }); }
});

// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// STATS
// ══════════════════════════════════════════════

app.get('/api/stats', requireAuth, async (req, res) => {
    const spots = await sql`SELECT * FROM spots WHERE user_id = ${req.user.user_id}`;
    const totalRarityPoints = spots.reduce((sum, s) => sum + (s.car_rarity || 0), 0);
    const uniqueMakes = new Set(spots.map(s => s.car_make).filter(Boolean));
    const rarestSpot = spots.length > 0 ? spots.reduce((r, s) => (s.car_rarity || 0) > (r.car_rarity || 0) ? s : r, spots[0]) : null;

    res.json({
        totalSpots: spots.length, totalRarityPoints: Math.round(totalRarityPoints),
        uniqueMakes: uniqueMakes.size,
        averageRarity: spots.length > 0 ? (totalRarityPoints / spots.length).toFixed(1) : 0,
        level: Math.floor(totalRarityPoints / 200) + 1,
        xpProgress: ((totalRarityPoints % 200) / 200) * 100,
        rarestFind: rarestSpot ? formatSpot(rarestSpot) : null,
    });
});

// ══════════════════════════════════════════════
// LEADERBOARD
// ══════════════════════════════════════════════

app.get('/api/leaderboard', requireAuth, async (req, res) => {
    const users = await sql`
        SELECT u.id, u.username, u.avatar, u.role, COUNT(s.id) as total_spots, COALESCE(SUM(s.car_rarity), 0) as total_rarity_points
        FROM users u LEFT JOIN spots s ON u.id = s.user_id WHERE u.role != 'admin'
        GROUP BY u.id ORDER BY total_rarity_points DESC
    `;
    res.json({
        leaderboard: users.map(u => ({
            id: u.id, username: u.username, avatar: u.avatar,
            totalSpots: parseInt(u.total_spots), totalRarityPoints: Math.round(parseFloat(u.total_rarity_points)),
            level: Math.floor(parseFloat(u.total_rarity_points) / 20) + 1,
        }))
    });
});

// ══════════════════════════════════════════════
// AUDIT
// ══════════════════════════════════════════════

app.get('/api/audit', requireAuth, requireAdmin, async (req, res) => {
    const log = await sql`SELECT * FROM audit_log ORDER BY created_at DESC`;
    const total = log.length;
    const overridden = log.filter(e => e.was_overridden).length;
    const accurate = total - overridden;
    const highConf = log.filter(e => e.confidence >= 80);
    const lowConf = log.filter(e => e.confidence < 80);
    const overriddenMakes = {};
    log.filter(e => e.was_overridden).forEach(e => { const make = e.ai_prediction?.make || 'Unknown'; overriddenMakes[make] = (overriddenMakes[make] || 0) + 1; });

    res.json({
        log: log.map(e => ({ id: e.id, userId: e.user_id, timestamp: e.created_at, aiPrediction: e.ai_prediction, userFinal: e.user_final, confidence: e.confidence, source: e.source, wasOverridden: e.was_overridden })),
        stats: {
            total, accurate, overridden, accuracyRate: total > 0 ? Math.round((accurate / total) * 100) : 0,
            highConfTotal: highConf.length, highConfAccurate: highConf.filter(e => !e.was_overridden).length,
            highConfRate: highConf.length > 0 ? Math.round((highConf.filter(e => !e.was_overridden).length / highConf.length) * 100) : 0,
            lowConfTotal: lowConf.length, lowConfAccurate: lowConf.filter(e => !e.was_overridden).length,
            lowConfRate: lowConf.length > 0 ? Math.round((lowConf.filter(e => !e.was_overridden).length / lowConf.length) * 100) : 0,
            topOverriddenMakes: Object.entries(overriddenMakes).sort((a, b) => b[1] - a[1]).slice(0, 5),
        },
    });
});

app.post('/api/audit', requireAuth, async (req, res) => {
    const { aiPrediction, userFinal, confidence, source, wasOverridden } = req.body;
    await sql`
        INSERT INTO audit_log (user_id, ai_prediction, user_final, confidence, source, was_overridden)
        VALUES (${req.user.user_id}, ${JSON.stringify(aiPrediction)}, ${JSON.stringify(userFinal)}, ${confidence}, ${source}, ${wasOverridden})
    `;
    res.json({ success: true });
});

app.delete('/api/audit', requireAuth, requireAdmin, async (req, res) => {
    await sql`DELETE FROM audit_log`;
    res.json({ success: true });
});

// ══════════════════════════════════════════════
// ADMIN STATS
// ══════════════════════════════════════════════

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    const [userCount] = await sql`SELECT COUNT(*) as count FROM users`;
    const [spotCount] = await sql`SELECT COUNT(*) as count FROM spots`;
    const [raritySum] = await sql`SELECT COALESCE(SUM(car_rarity), 0) as total FROM spots`;
    res.json({
        totalUsers: parseInt(userCount.count), totalSpots: parseInt(spotCount.count),
        totalPoints: Math.round(parseFloat(raritySum.total)),
    });
});

app.get('/api/admin/spots', requireAuth, requireAdmin, async (req, res) => {
    try {
        const spots = await sql`
            SELECT s.*, u.username, u.avatar FROM spots s
            JOIN users u ON s.user_id = u.id ORDER BY s.spotted_at DESC
        `;
        res.json({ spots: spots.map(s => ({ ...formatSpot(s), spotter: { username: s.username, avatar: s.avatar } })) });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch spots' }); }
});

// ══════════════════════════════════════════════
// PUBLIC ROUTES (no auth — for sharing)
// ══════════════════════════════════════════════

app.get('/api/public/spot/:id', async (req, res) => {
    try {
        const [spot] = await sql`
            SELECT s.*, u.username, u.avatar FROM spots s JOIN users u ON s.user_id = u.id WHERE s.id = ${req.params.id}
        `;
        if (!spot) return res.status(404).json({ error: 'Spot not found' });
        res.json({ spot: { ...formatSpot(spot), spotter: { username: spot.username, avatar: spot.avatar } } });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch spot' }); }
});

app.get('/api/public/users', async (req, res) => {
    try {
        const q = req.query.q || '';
        let users;
        if (q) {
            users = await sql`
                SELECT u.id, u.username, u.avatar, u.joined_at,
                    COUNT(s.id) as spot_count, COALESCE(SUM(s.car_rarity), 0) as total_rarity
                FROM users u LEFT JOIN spots s ON s.user_id = u.id
                WHERE u.role != 'admin' AND LOWER(u.username) LIKE LOWER(${`%${q}%`})
                GROUP BY u.id ORDER BY total_rarity DESC
            `;
        } else {
            users = await sql`
                SELECT u.id, u.username, u.avatar, u.joined_at,
                    COUNT(s.id) as spot_count, COALESCE(SUM(s.car_rarity), 0) as total_rarity
                FROM users u LEFT JOIN spots s ON s.user_id = u.id
                WHERE u.role != 'admin'
                GROUP BY u.id ORDER BY total_rarity DESC
            `;
        }
        const userIds = users.map(u => u.id);
        let starredMap = {};
        if (userIds.length > 0) {
            const starredSpots = await sql`
                SELECT DISTINCT ON (user_id) user_id, car_make, car_model, car_rarity, car_image
                FROM spots WHERE user_id = ANY(${userIds}) AND starred = true
                ORDER BY user_id, car_rarity DESC
            `;
            starredSpots.forEach(s => {
                starredMap[s.user_id] = { make: s.car_make, model: s.car_model, rarity: s.car_rarity, image: s.car_image };
            });
        }
        res.json({
            users: users.map(u => ({
                username: u.username, avatar: u.avatar, joinedAt: u.joined_at,
                spotCount: parseInt(u.spot_count), totalRarity: Math.round(parseFloat(u.total_rarity)),
                level: Math.floor(parseFloat(u.total_rarity) / 200) + 1, topStarred: starredMap[u.id] || null,
            })),
        });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch users' }); }
});

app.get('/api/public/profile/:username', async (req, res) => {
    try {
        const [user] = await sql`SELECT id, username, avatar, joined_at FROM users WHERE LOWER(username) = LOWER(${req.params.username})`;
        if (!user) return res.status(404).json({ error: 'User not found' });
        const spots = await sql`SELECT * FROM spots WHERE user_id = ${user.id} ORDER BY starred DESC, car_rarity DESC`;
        const [countRow] = await sql`SELECT COUNT(*) as total FROM spots WHERE user_id = ${user.id}`;
        const [rarityRow] = await sql`SELECT COALESCE(SUM(car_rarity), 0) as total FROM spots WHERE user_id = ${user.id}`;
        const [makesRow] = await sql`SELECT COUNT(DISTINCT car_make) as total FROM spots WHERE user_id = ${user.id}`;
        const totalPoints = Math.round(parseFloat(rarityRow.total));
        const formattedSpots = spots.map(formatSpot);
        const rarestSpot = formattedSpots.length > 0 ? formattedSpots.reduce((a, b) => a.car.rarity > b.car.rarity ? a : b) : null;
        res.json({
            profile: {
                username: user.username, avatar: user.avatar, joinedAt: user.joined_at,
                totalSpots: parseInt(countRow.total), totalRarityPoints: totalPoints,
                level: Math.floor(totalPoints / 200) + 1, uniqueMakes: parseInt(makesRow.total),
                rarestFind: rarestSpot ? { name: `${rarestSpot.car.make} ${rarestSpot.car.model}`, rarity: rarestSpot.car.rarity } : null,
                spots: formattedSpots,
            }
        });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

app.get('/api/public/spot-of-the-day', async (req, res) => {
    try {
        let [spot] = await sql`
            SELECT s.*, u.username, u.avatar FROM spots s JOIN users u ON s.user_id = u.id
            WHERE s.spotted_at >= CURRENT_DATE ORDER BY s.car_rarity DESC LIMIT 1
        `;
        if (!spot) {
            [spot] = await sql`
                SELECT s.*, u.username, u.avatar FROM spots s JOIN users u ON s.user_id = u.id
                ORDER BY s.car_rarity DESC LIMIT 1
            `;
        }
        if (!spot) return res.json({ spotOfTheDay: null });
        res.json({ spotOfTheDay: { ...formatSpot(spot), spotter: { username: spot.username, avatar: spot.avatar } } });
    } catch (err) { res.status(500).json({ error: 'Failed to fetch spot of the day' }); }
});

// Vercel serverless handler
export default app;
