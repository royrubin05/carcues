import { useSearchParams, Link } from 'react-router-dom';
import './LoginPage.css';

export default function CheckEmailPage() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || 'your email';

    return (
        <div className="login-page">
            <div className="login-bg">
                <div className="login-grid" />
                <div className="login-glow login-glow-1" />
                <div className="login-glow login-glow-2" />
            </div>

            <div className="login-container animate-fade-in-up" style={{ textAlign: 'center' }}>
                <div style={{
                    fontSize: '3.5rem',
                    marginBottom: '16px',
                    animation: 'float 2s ease-in-out infinite',
                }}>📧</div>

                <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.5rem' }}>
                    Check Your Inbox
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.6 }}>
                    We've sent a verification email to
                </p>
                <p style={{
                    color: 'var(--accent-blue)',
                    fontWeight: 600,
                    marginBottom: '24px',
                    fontSize: '1.05rem',
                    wordBreak: 'break-all',
                }}>
                    {email}
                </p>

                <div style={{
                    background: 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid rgba(14, 165, 233, 0.15)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    textAlign: 'left',
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 10px', lineHeight: 1.6 }}>
                        📬 Open the email and click <strong style={{ color: 'var(--text-primary)' }}>"Verify My Email"</strong>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 10px', lineHeight: 1.6 }}>
                        ✅ Once verified, you'll be <strong style={{ color: 'var(--text-primary)' }}>automatically logged in</strong>
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 10px', lineHeight: 1.6 }}>
                        Don't see the email? Check your <strong>spam/junk folder</strong>.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>
                        ⏰ The link expires in 24 hours.
                    </p>
                </div>

                <Link to="/login" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
                    Already verified? Go to Login →
                </Link>
            </div>
        </div>
    );
}
