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
            subject: '📧 Verify your CarCues account',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0f0f1a; color: #e0e0e8; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #0ea5e9; font-size: 24px; margin: 0;">CarCues</h1>
                        <p style="color: #888; margin: 4px 0 0;">Verify Your Email</p>
                    </div>
                    <p>Hey ${username}! 👋</p>
                    <p>Welcome to CarCues! Click the button below to verify your email and unlock your full experience:</p>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${verifyUrl}" style="background: #0ea5e9; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                            Verify My Email
                        </a>
                    </div>
                    <p style="color: #888; font-size: 13px;">This link expires in 24 hours. If you didn't create a CarCues account, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #2a2a3d; margin: 24px 0;" />
                    <p style="color: #666; font-size: 12px; text-align: center;">CarCues — Spot Rare Cars</p>
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
