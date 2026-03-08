import { useState, useEffect, useRef } from 'react';

export default function StatsCard({ icon, label, value, color = 'var(--accent-blue)', suffix = '', delay = 0 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const cardRef = useRef(null);
    const animated = useRef(false);

    useEffect(() => {
        if (animated.current) return;
        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) {
            setDisplayValue(value);
            return;
        }

        const timer = setTimeout(() => {
            animated.current = true;
            const duration = 1000;
            const steps = 40;
            const stepValue = numericValue / steps;
            let current = 0;
            let step = 0;

            const interval = setInterval(() => {
                step++;
                current = Math.min(numericValue, stepValue * step);
                setDisplayValue(Number.isInteger(numericValue) ? Math.floor(current) : current.toFixed(1));
                if (step >= steps) {
                    clearInterval(interval);
                    setDisplayValue(numericValue);
                }
            }, duration / steps);
        }, delay * 150);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return (
        <div
            ref={cardRef}
            className="stats-card animate-fade-in-up"
            style={{
                animationDelay: `${delay * 0.1}s`,
                '--stat-color': color,
            }}
        >
            <style>{`
        .stats-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          position: relative;
          overflow: hidden;
          transition: all var(--transition-normal);
        }
        .stats-card:hover {
          border-color: var(--stat-color);
          box-shadow: 0 0 20px color-mix(in srgb, var(--stat-color) 20%, transparent);
          transform: translateY(-2px);
        }
        .stats-card-icon {
          font-size: 2rem;
          margin-bottom: var(--space-sm);
        }
        .stats-card-value {
          font-size: var(--font-3xl);
          font-weight: 800;
          color: var(--stat-color);
          line-height: 1;
          margin-bottom: var(--space-xs);
        }
        .stats-card-label {
          font-size: var(--font-sm);
          color: var(--text-secondary);
          font-weight: 500;
        }
        .stats-card-bg {
          position: absolute;
          right: -10px;
          bottom: -10px;
          font-size: 5rem;
          opacity: 0.06;
          pointer-events: none;
        }
      `}</style>
            <div className="stats-card-icon">{icon}</div>
            <div className="stats-card-value">
                {displayValue}{suffix}
            </div>
            <div className="stats-card-label">{label}</div>
            <div className="stats-card-bg">{icon}</div>
        </div>
    );
}
