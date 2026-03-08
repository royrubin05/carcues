import { getRarityTier } from '../data/mockData';

export default function RarityBadge({ score, size = 'md' }) {
    const tier = getRarityTier(score);

    const sizes = {
        sm: { fontSize: '0.7rem', padding: '2px 8px' },
        md: { fontSize: '0.8rem', padding: '4px 12px' },
        lg: { fontSize: '1rem', padding: '6px 16px' },
    };

    return (
        <span
            className={`rarity-badge ${tier.className}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                ...sizes[size],
                background: `color-mix(in srgb, ${tier.color} 15%, transparent)`,
                color: tier.color,
                border: `1px solid color-mix(in srgb, ${tier.color} 30%, transparent)`,
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
            }}
        >
            {tier.name} · {score}
        </span>
    );
}
