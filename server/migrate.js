import sql from './db.js';

async function migrate() {
    console.log('🗄️  Running CarCues database migration...\n');

    // ── Create tables ──
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            avatar VARCHAR(10) DEFAULT '🏎️',
            password_hash VARCHAR(255) NOT NULL,
            joined_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('✅ users table ready');

    await sql`
        CREATE TABLE IF NOT EXISTS spots (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            car_make VARCHAR(100) NOT NULL,
            car_model VARCHAR(200) NOT NULL,
            car_year INTEGER,
            car_category VARCHAR(50),
            car_rarity REAL DEFAULT 15,
            car_image TEXT,
            location_lat DOUBLE PRECISION,
            location_lng DOUBLE PRECISION,
            location_city VARCHAR(200),
            location_country VARCHAR(100),
            source VARCHAR(20) DEFAULT 'gemini',
            spotted_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('✅ spots table ready');

    await sql`
        CREATE TABLE IF NOT EXISTS wishlist (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            car_data JSONB NOT NULL,
            added_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, car_data)
        )
    `;
    console.log('✅ wishlist table ready');

    await sql`
        CREATE TABLE IF NOT EXISTS audit_log (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            ai_prediction JSONB,
            user_final JSONB,
            confidence REAL,
            source VARCHAR(20),
            was_overridden BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('✅ audit_log table ready');

    await sql`
        CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(64) PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
        )
    `;
    console.log('✅ sessions table ready');

    await sql`
        CREATE TABLE IF NOT EXISTS car_database (
            id SERIAL PRIMARY KEY,
            make VARCHAR(100) NOT NULL,
            model VARCHAR(200) NOT NULL,
            year INTEGER,
            category VARCHAR(50),
            rarity REAL DEFAULT 15,
            msrp VARCHAR(50),
            production_count INTEGER
        )
    `;
    console.log('✅ car_database table ready');

    await sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(64) UNIQUE NOT NULL,
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour'),
            used BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
    console.log('✅ password_reset_tokens table ready');

    // Add starred column if it doesn't exist
    await sql`ALTER TABLE spots ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false`;
    console.log('✅ starred column ready');

    // ── Email verification ──
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ`;
    console.log('✅ email_verified columns ready');

    await sql`
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(64) UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
            used BOOLEAN DEFAULT false
        )
    `;
    console.log('✅ email_verification_tokens table ready');

    console.log('\n🎉 Migration complete! Tables are ready.');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
