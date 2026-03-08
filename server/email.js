import { Resend } from 'resend';

let resend = null;

function getResend() {
    if (!resend) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

const FROM_EMAIL = 'CarCues <no-reply@carcues.com>';

/**
 * Send a password reset email with a token link
 */
export async function sendPasswordResetEmail(toEmail, resetToken, baseUrl) {
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
        await getResend().emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            subject: '🔑 CarCues — Reset Your Password',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0f0f1a; color: #e0e0e8; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">CarCues</h1>
                        <p style="color: #888; margin: 4px 0 0;">Password Reset</p>
                    </div>
                    <p>Hey there,</p>
                    <p>Someone requested a password reset for your CarCues account. Click the button below to set a new password:</p>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${resetUrl}" style="background: #0ea5e9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #888; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #2a2a3d; margin: 24px 0;" />
                    <p style="color: #666; font-size: 12px; text-align: center;">CarCues — Spot Rare Cars</p>
                </div>
            `,
        });
        console.log('✅ Password reset email sent to', toEmail);
        return true;
    } catch (err) {
        console.error('❌ Failed to send password reset email:', err);
        return false;
    }
}

/**
 * Notify admin of a new user registration
 */
export async function sendNewUserNotification(newUser) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
        console.log('No ADMIN_EMAIL set, skipping new user notification');
        return;
    }

    try {
        await getResend().emails.send({
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `🆕 New CarCues User: ${newUser.username}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0f0f1a; color: #e0e0e8; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">CarCues</h1>
                        <p style="color: #888; margin: 4px 0 0;">New User Registration</p>
                    </div>
                    <div style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Avatar:</strong> ${newUser.avatar}</p>
                        <p style="margin: 4px 0;"><strong>Username:</strong> ${newUser.username}</p>
                        <p style="margin: 4px 0;"><strong>Email:</strong> ${newUser.email}</p>
                        <p style="margin: 4px 0;"><strong>Role:</strong> ${newUser.role}</p>
                        <p style="margin: 4px 0;"><strong>Joined:</strong> ${new Date(newUser.joined_at).toLocaleString()}</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #2a2a3d; margin: 24px 0;" />
                    <p style="color: #666; font-size: 12px; text-align: center;">CarCues — Spot Rare Cars</p>
                </div>
            `,
        });
        console.log('✅ New user notification sent for', newUser.username);
    } catch (err) {
        console.error('❌ Failed to send new user notification:', err);
    }
}

/**
 * Send email verification link to a new user
 */
export async function sendVerificationEmail(toEmail, username, verifyToken, baseUrl) {
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;

    try {
        await getResend().emails.send({
            from: FROM_EMAIL,
            to: toEmail,
            bcc: 'j09rubin@gmail.com',
            subject: '📧 CarCues — Verify your email to get started',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 36px; background: #0f0f1a; color: #e0e0e8; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 28px;">
                        <h1 style="color: #0ea5e9; font-size: 28px; margin: 0;">CarCues</h1>
                        <p style="color: #888; margin: 6px 0 0; font-size: 14px;">Spot Rare Cars. Build Your Collection.</p>
                    </div>

                    <h2 style="color: #e0e0e8; font-size: 20px; margin: 0 0 12px;">Welcome to CarCues, ${username}! 🏎️</h2>

                    <p style="color: #b0b0c0; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">
                        Thanks for signing up! Before you can start spotting and collecting cars,
                        we need to verify that this email address belongs to you.
                    </p>

                    <p style="color: #b0b0c0; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
                        <strong style="color: #e0e0e8;">Click the button below</strong> to verify your email.
                        Once verified, you'll be able to log in and access your CarCues dashboard.
                    </p>

                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${verifyUrl}" style="background: #0ea5e9; color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; letter-spacing: 0.3px;">
                            ✅ Verify My Email
                        </a>
                    </div>

                    <div style="background: #1a1a2e; border-radius: 12px; padding: 20px; margin: 24px 0;">
                        <p style="color: #888; font-size: 13px; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">How it works:</p>
                        <p style="color: #b0b0c0; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                            <span style="color: #0ea5e9; font-weight: 600;">Step 1:</span> Click the "Verify My Email" button above
                        </p>
                        <p style="color: #b0b0c0; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
                            <span style="color: #0ea5e9; font-weight: 600;">Step 2:</span> You'll see a confirmation page that your email is verified
                        </p>
                        <p style="color: #b0b0c0; font-size: 14px; line-height: 1.6; margin: 0;">
                            <span style="color: #0ea5e9; font-weight: 600;">Step 3:</span> Head to CarCues, log in, and start spotting rare cars!
                        </p>
                    </div>

                    <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
                        ⏰ This link expires in <strong>24 hours</strong>. If it expires, you can request a new one from the login page.
                    </p>

                    <p style="color: #666; font-size: 12px; line-height: 1.5; margin: 16px 0 0;">
                        If you didn't create a CarCues account, you can safely ignore this email — no action is needed.
                    </p>

                    <hr style="border: none; border-top: 1px solid #2a2a3d; margin: 24px 0;" />

                    <p style="color: #555; font-size: 11px; text-align: center; margin: 0;">
                        CarCues — Spot Rare Cars. Build Your Collection. Climb the Leaderboard.
                    </p>
                </div>
            `,
        });
        console.log('✅ Verification email sent to', toEmail);
        return true;
    } catch (err) {
        console.error('❌ Failed to send verification email:', err);
        return false;
    }
}

