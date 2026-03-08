import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { getUserSpots } from '../services/carService';
import { getRarityTier } from '../data/mockData';
import RarityBadge from '../components/RarityBadge';
import './MapPage.css';

// Fix leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
function createColoredIcon(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px ${color}40;
    "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -16],
    });
}

export default function MapPage() {
    const { user } = useAuth();
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUserSpots(user.id)
            .then(data => setSpots(data))
            .catch(err => console.error('Failed to load spots:', err))
            .finally(() => setLoading(false));
    }, [user.id]);

    const validSpots = spots.filter(s => s.location?.lat && s.location?.lng);

    // Calculate center of all spots
    const center = useMemo(() => {
        if (validSpots.length === 0) return [39.8283, -98.5795]; // US center
        const avgLat = validSpots.reduce((sum, s) => sum + s.location.lat, 0) / validSpots.length;
        const avgLng = validSpots.reduce((sum, s) => sum + s.location.lng, 0) / validSpots.length;
        return [avgLat, avgLng];
    }, [validSpots]);

    return (
        <div className="map-page">
            <div className="page-header">
                <h1>🗺️ Spot Map</h1>
                <p>{validSpots.length} locations mapped</p>
            </div>

            {/* Map Legend */}
            <div className="map-legend animate-fade-in-up">
                <span className="legend-title">Rarity:</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--rarity-common)' }} /> Common</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--rarity-uncommon)' }} /> Uncommon</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--rarity-rare)' }} /> Rare</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--rarity-epic)' }} /> Epic</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--rarity-legendary)' }} /> Legendary</span>
                <span className="legend-item"><span className="legend-dot" style={{ background: 'var(--rarity-mythic)' }} /> Mythic</span>
            </div>

            {/* Map */}
            <div className="map-container animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <MapContainer
                    center={center}
                    zoom={4}
                    style={{ height: '100%', width: '100%' }}
                    id="spots-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    {validSpots.map(spot => {
                        const tier = getRarityTier(spot.car.rarity);
                        return (
                            <Marker
                                key={spot.id}
                                position={[spot.location.lat, spot.location.lng]}
                                icon={createColoredIcon(tier.color)}
                            >
                                <Popup>
                                    <div className="map-popup">
                                        <img src={spot.car.image} alt={spot.car.model} className="popup-image" />
                                        <div className="popup-info">
                                            <strong>{spot.car.make} {spot.car.model}</strong>
                                            <span className="popup-year">{spot.car.year} · {spot.car.category}</span>
                                            <span className="popup-rarity" style={{ color: tier.color }}>
                                                {tier.name} · {spot.car.rarity}
                                            </span>
                                            <span className="popup-location">📍 {spot.location.city}</span>
                                            <span className="popup-date">
                                                {new Date(spot.spottedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            {/* Spot List (sidebar on desktop) */}
            <div className="map-sidebar animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="sidebar-title">📍 Spotted Locations</h3>
                <div className="spot-list">
                    {validSpots.map(spot => {
                        const tier = getRarityTier(spot.car.rarity);
                        return (
                            <div key={spot.id} className="spot-list-item">
                                <div className="spot-dot" style={{ background: tier.color }} />
                                <div className="spot-list-info">
                                    <span className="spot-list-car">{spot.car.make} {spot.car.model}</span>
                                    <span className="spot-list-location">{spot.location.city}</span>
                                </div>
                                <RarityBadge score={spot.car.rarity} size="sm" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
