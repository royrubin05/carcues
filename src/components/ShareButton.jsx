import { useState, useCallback } from 'react';
import './ShareButton.css';

export default function ShareButton({ url, text }) {
    const [copied, setCopied] = useState(false);

    const handleShare = useCallback(async () => {
        // Try native share (mobile)
        if (navigator.share) {
            try {
                await navigator.share({ title: 'CarCues', text, url });
                return;
            } catch (err) {
                if (err.name === 'AbortError') return; // user cancelled
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Last resort: select + copy
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [url, text]);

    return (
        <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={handleShare}>
            {copied ? '✓ Copied!' : '📤 Share'}
        </button>
    );
}
