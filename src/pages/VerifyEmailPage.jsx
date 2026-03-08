import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './PublicPages.css';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('loading'); // loading | success | already | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        fetch(`/api/auth/verify-email?token=${token}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    if (data.message?.includes('already')) {
                        setStatus('already');
                        setMessage('Your email is already verified!');
                    } else {
                        setStatus('success');
                        setMessage('Your email has been verified!');
                    }
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            });
    }, [token]);

    return (
        <div className="public-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                background: 'var(--bg-secondary, #1a1a2e)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.06)',
                maxWidth: '420px',
                width: '100%',
                margin: '0 16px',
            }}>
                {status === 'loading' && (
                    <>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📧</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Verifying your email...</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Just a moment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
                        <h2 style={{ color: 'var(--accent-green, #22c55e)', marginBottom: '8px' }}>Email Verified!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{message}</p>
                        <Link to="/" style={{
                            display: 'inline-block',
                            background: 'var(--accent-blue, #0ea5e9)',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            Go to Dashboard
                        </Link>
                    </>
                )}

                {status === 'already' && (
                    <>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>👍</div>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Already Verified</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{message}</p>
                        <Link to="/" style={{
                            display: 'inline-block',
                            background: 'var(--accent-blue, #0ea5e9)',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            Go to Dashboard
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>❌</div>
                        <h2 style={{ color: 'var(--accent-orange, #f59e0b)', marginBottom: '8px' }}>Verification Failed</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{message}</p>
                        <Link to="/login" style={{
                            display: 'inline-block',
                            background: 'var(--accent-blue, #0ea5e9)',
                            color: 'white',
                            padding: '12px 28px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            Log In to Resend
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
