import { getRarityTier } from '../data/mockData';
import './CarCard.css';

export default function CarCard({ spot, onClick, delay = 0 }) {
    const car = spot.car;
    const tier = getRarityTier(car.rarity);

    return (
        <div
            className="car-card"
            onClick={() => onClick?.(spot)}
            style={{
                '--rarity-color': tier.color,
                animationDelay: `${delay * 0.08}s`,
            }}
            id={`car-card-${spot.id}`}
        >
            <div className="car-card-image">
                <img src={car.image} alt={`${car.make} ${car.model}`} loading="lazy" />
                <div className="car-card-rarity" style={{ background: tier.color }}>
                    {car.rarity}
                </div>
                <div className="car-card-tier" style={{ color: tier.color }}>
                    {tier.name}
                </div>
            </div>

            <div className="car-card-body">
                <h3 className="car-card-title">{car.make} {car.model}</h3>
                <div className="car-card-meta">
                    <span className="car-card-year">{car.year}</span>
                    <span className="car-card-category">{car.category}</span>
                </div>
                {spot.location && (
                    <div className="car-card-location">
                        📍 {spot.location.city}
                    </div>
                )}
                {spot.spottedAt && (
                    <div className="car-card-date">
                        {new Date(spot.spottedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </div>
                )}
            </div>

            <div className="car-card-glow" />
        </div>
    );
}
