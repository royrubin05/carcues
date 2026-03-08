import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeCarPhoto, addSpot } from '../services/carService';
import { logAuditEntry } from '../services/aiAuditService';
import { getRarityTier } from '../data/mockData';
import { extractGPSFromPhoto, reverseGeocode } from '../services/locationService';
import { getMakes, getModels, getYears, calculateRarityFromDatabase, getProductionCount } from '../services/vehicleDataService';
import RarityBadge from '../components/RarityBadge';
import './UploadPage.css';

const CONFIDENCE_THRESHOLD = 80;

const CAR_CATEGORIES = [
    'Supercar', 'Hypercar', 'Sports Car', 'Muscle Car', 'Luxury',
    'Sedan', 'SUV', 'Truck', 'Hatchback', 'Convertible', 'Coupe',
    'Electric', 'Classic', 'Race Car', 'Rally', 'Van', 'Other',
];

export default function UploadPage() {
    const { user, isAdmin } = useAuth();
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [photoLocation, setPhotoLocation] = useState(null);
    const [manualLocation, setManualLocation] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Editable override fields
    const [overrideMake, setOverrideMake] = useState('');
    const [overrideModel, setOverrideModel] = useState('');
    const [overrideYear, setOverrideYear] = useState('');
    const [overrideCategory, setOverrideCategory] = useState('');
    const [customMake, setCustomMake] = useState('');
    const [customModel, setCustomModel] = useState('');

    // Derived data from curated database (synchronous — no API calls)
    const yearsList = getYears();
    const makesList = getMakes();
    const modelsList = overrideMake && overrideMake !== '__OTHER__' && overrideYear
        ? getModels(overrideMake, overrideYear) : [];

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setSelectedImage(file);
        setResult(null);
        setSaved(false);
        setPhotoLocation(null);
        setManualLocation('');
        setError(null);
        resetOverrides();

        // Read image preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);

        // Extract GPS from EXIF data
        setLocationLoading(true);
        try {
            const gps = await extractGPSFromPhoto(file);
            if (gps) {
                const cityName = await reverseGeocode(gps.lat, gps.lng);
                setPhotoLocation({
                    lat: gps.lat,
                    lng: gps.lng,
                    city: cityName || `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`,
                });
            }
        } catch (err) {
            console.warn('GPS extraction failed:', err);
        }
        setLocationLoading(false);
    };

    const resetOverrides = () => {
        setOverrideMake('');
        setOverrideModel('');
        setOverrideYear('');
        setOverrideCategory('');
        setCustomMake('');
        setCustomModel('');
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    };

    const handleAnalyze = async () => {
        if (!selectedImage) return;
        setAnalyzing(true);
        setScanProgress(0);
        setResult(null);
        setError(null);
        resetOverrides();

        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 90) { clearInterval(progressInterval); return 90; }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            const analysis = await analyzeCarPhoto(selectedImage);
            clearInterval(progressInterval);
            setScanProgress(100);

            setTimeout(() => {
                setAnalyzing(false);
                if (!analysis.identified) {
                    setError(analysis.error || 'Could not identify a car in this photo.');
                } else {
                    if (!analysis.car.image) {
                        analysis.car.image = imagePreview;
                    }
                    // Pre-fill override fields with AI's guess
                    const aiMake = analysis.car.make || '';
                    const aiModel = analysis.car.model || '';
                    const aiYear = String(analysis.car.year || '');
                    const knownMakes = getMakes();

                    // If AI's make is in our database, use dropdown; otherwise use Other
                    if (knownMakes.includes(aiMake)) {
                        setOverrideMake(aiMake);
                        // Check if model is available for this make+year
                        const knownModels = getModels(aiMake, aiYear);
                        if (knownModels.includes(aiModel)) {
                            setOverrideModel(aiModel);
                        } else {
                            setOverrideModel('__OTHER__');
                            setCustomModel(aiModel);
                        }
                    } else {
                        setOverrideMake('__OTHER__');
                        setCustomMake(aiMake);
                        setCustomModel(aiModel);
                    }
                    setOverrideYear(aiYear);
                    setOverrideCategory(analysis.car.category || '');
                    setResult(analysis);
                }
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setAnalyzing(false);
            setError('Analysis failed. Please try again.');
        }
    };

    // Get the effective car data (override fields take priority, resolve __OTHER__)
    // Recalculate rarity using production-based algorithm when make/model are from our database
    const getEffectiveCar = () => {
        if (!result) return null;
        const effectiveMake = overrideMake === '__OTHER__' ? customMake : (overrideMake || result.car.make);
        const effectiveModel = overrideModel === '__OTHER__' ? customModel : (overrideModel || result.car.model);
        const effectiveCategory = overrideCategory || result.car.category;

        // Recalculate rarity using production numbers from curated database
        const dbRarity = calculateRarityFromDatabase(effectiveMake, effectiveModel, effectiveCategory);
        const produced = getProductionCount(effectiveMake, effectiveModel);

        return {
            ...result.car,
            make: effectiveMake,
            model: effectiveModel,
            year: parseInt(overrideYear) || result.car.year,
            category: effectiveCategory,
            rarity: dbRarity,
            produced, // null if unknown
        };
    };

    const isHighConfidence = result && result.confidence >= CONFIDENCE_THRESHOLD;

    // Compress image to a small thumbnail for localStorage
    const createThumbnail = (dataUrl, maxWidth = 600) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(maxWidth / img.width, 1); // Don't upscale
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => resolve(null);
            img.src = dataUrl;
        });
    };

    const handleSave = async () => {
        if (!result) return;

        const effectiveCar = getEffectiveCar();
        if (!effectiveCar.make || !effectiveCar.model) {
            setError('Please enter at least a Make and Model before saving.');
            return;
        }

        // Recalculate rarity from the visionService algorithm if overridden
        // For simplicity keep the AI rarity or override manually

        let location = null;
        if (photoLocation) {
            location = photoLocation;
        } else if (manualLocation.trim()) {
            location = {
                city: manualLocation.trim(),
                lat: 34.05 + (Math.random() - 0.5) * 0.1,
                lng: -118.25 + (Math.random() - 0.5) * 0.1,
            };
        }

        let thumbnail = effectiveCar.image;
        if (imagePreview && imagePreview.startsWith('data:')) {
            thumbnail = await createThumbnail(imagePreview) || effectiveCar.image;
        }

        const spot = {
            id: `spot-${user.id}-${Date.now()}`,
            carId: effectiveCar.id,
            userId: user.id,
            car: { ...effectiveCar, image: thumbnail },
            location,
            spottedAt: new Date().toISOString(),
            photoUrl: thumbnail,
            notes: '',
        };

        try {
            addSpot(user.id, spot);

            // Log AI audit entry
            const aiPrediction = {
                make: result.car.make,
                model: result.car.model,
                year: result.car.year,
                category: result.car.category,
            };
            const userFinalData = {
                make: effectiveCar.make,
                model: effectiveCar.model,
                year: effectiveCar.year,
                category: effectiveCar.category,
            };
            const wasOverridden = (
                aiPrediction.make !== userFinalData.make ||
                aiPrediction.model !== userFinalData.model ||
                aiPrediction.year !== userFinalData.year ||
                aiPrediction.category !== userFinalData.category
            );
            logAuditEntry({
                userId: user.id,
                timestamp: new Date().toISOString(),
                aiPrediction,
                userFinal: userFinalData,
                confidence: result.confidence,
                source: result.source,
                wasOverridden,
            });

            setSaved(true);
            setError(null);
        } catch (err) {
            console.error('Save failed:', err);
            setError('Failed to save — storage may be full. Try clearing old spots.');
        }
    };

    const handleReset = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setResult(null);
        setSaved(false);
        setAnalyzing(false);
        setScanProgress(0);
        setError(null);
        setPhotoLocation(null);
        setManualLocation('');
        resetOverrides();
    };

    const effectiveCar = getEffectiveCar();
    const tier = effectiveCar ? getRarityTier(effectiveCar.rarity || result?.car?.rarity || 3) : null;

    // ───── Common styles ─────
    const inputStyle = {
        width: '100%',
        padding: '10px 12px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: 'var(--font-sm)',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        fontSize: 'var(--font-xs)',
        color: 'var(--text-secondary)',
        fontWeight: 600,
        display: 'block',
        marginBottom: '4px',
    };

    const fieldGroupStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-md)',
    };

    return (
        <div className="upload-page">
            <div className="page-header">
                <h1>📸 Spot a Car</h1>
                <p>Upload a photo and let AI identify the car</p>
            </div>

            {/* Upload Zone */}
            {!imagePreview && (
                <div
                    className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    id="upload-zone"
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                        style={{ display: 'none' }}
                        id="file-input"
                    />
                    <div className="upload-zone-content">
                        <div className="upload-icon">📷</div>
                        <h3>Drop your car photo here</h3>
                        <p>or click to browse files</p>
                        <p className="upload-hint">JPG, PNG, WEBP — Up to 10MB</p>
                    </div>
                </div>
            )}

            {/* Preview + Analysis */}
            {imagePreview && (
                <div className="upload-preview-container animate-fade-in-up">
                    <div className="upload-preview">
                        <div className="preview-image-wrapper">
                            <img src={imagePreview} alt="Uploaded car" className="preview-image" />

                            {/* Scanning overlay */}
                            {analyzing && (
                                <div className="scan-overlay">
                                    <div className="scan-line" />
                                    <div className="scan-corners">
                                        <div className="scan-corner tl" />
                                        <div className="scan-corner tr" />
                                        <div className="scan-corner bl" />
                                        <div className="scan-corner br" />
                                    </div>
                                    <div className="scan-text">
                                        <div className="scan-spinner" />
                                        Analyzing... {Math.floor(scanProgress)}%
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action buttons — before analysis */}
                        {!analyzing && !result && !error && (
                            <div className="preview-actions">
                                <button className="btn btn-primary" onClick={handleAnalyze} id="analyze-btn">
                                    🤖 Analyze with AI
                                </button>
                                <button className="btn btn-ghost" onClick={handleReset} id="reset-btn">
                                    ↩ Choose Different Photo
                                </button>
                            </div>
                        )}

                        {/* Error state (no car detected / API failure) */}
                        {error && !result && (
                            <div className="preview-actions">
                                <div style={{
                                    padding: '14px',
                                    background: 'var(--accent-red-dim)',
                                    border: '1px solid rgba(255, 23, 68, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--accent-red)',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    marginBottom: '8px',
                                }}>
                                    ⚠️ {error}
                                </div>
                                <button className="btn btn-primary" onClick={handleAnalyze}>
                                    🔄 Try Again
                                </button>
                                <button className="btn btn-ghost" onClick={handleReset}>
                                    ↩ Choose Different Photo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ════════════════════════════════════════════════ */}
                    {/* Result Card — High Confidence (≥90%) */}
                    {/* ════════════════════════════════════════════════ */}
                    {result && isHighConfidence && (
                        <div className="analysis-result animate-fade-in-up" style={{ '--rarity-color': tier.color }}>
                            <div className="result-header">
                                <h2>🎯 Car Identified!</h2>
                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className="result-confidence" style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
                                            ✅ {result.confidence}% confident
                                        </span>
                                        <span style={{
                                            fontSize: 'var(--font-xs)',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            background: result.source === 'gemini' ? 'var(--accent-blue-dim)' : 'var(--accent-orange-dim)',
                                            color: result.source === 'gemini' ? 'var(--accent-blue)' : 'var(--accent-orange)',
                                            fontWeight: 600,
                                        }}>
                                            {result.source === 'gemini' ? '🤖 Gemini AI' : '🎲 Demo Mode'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="result-car-info">
                                <div className="result-car-name">
                                    <h3>{effectiveCar.make} {effectiveCar.model}</h3>
                                    <span className="result-year">{effectiveCar.year}</span>
                                </div>
                                <RarityBadge score={effectiveCar.rarity} size="lg" />
                            </div>

                            <div className="result-details">
                                <div className="detail-row">
                                    <span className="detail-label">Category</span>
                                    <span className="detail-value">{effectiveCar.category}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Production</span>
                                    <span className="detail-value" style={{ color: effectiveCar.produced && effectiveCar.produced <= 500 ? 'var(--accent-orange)' : 'var(--text-primary)', fontWeight: effectiveCar.produced ? 700 : 400 }}>
                                        {effectiveCar.produced
                                            ? `${effectiveCar.produced.toLocaleString()} units`
                                            : 'Mass Produced'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Rarity Score</span>
                                    <span className="detail-value" style={{ color: tier.color, fontWeight: 800 }}>
                                        {effectiveCar.rarity}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tier</span>
                                    <span className="detail-value" style={{ color: tier.color }}>
                                        {tier.name}
                                    </span>
                                </div>
                            </div>

                            {/* Rarity Score Meter */}
                            <div className="rarity-meter">
                                <div className="rarity-meter-label">Rarity Score</div>
                                <div className="rarity-meter-bar">
                                    <div
                                        className="rarity-meter-fill"
                                        style={{
                                            width: `${Math.min(effectiveCar.rarity, 100)}%`,
                                            background: `linear-gradient(90deg, var(--accent-green), ${tier.color})`,
                                        }}
                                    />
                                </div>
                                <div className="rarity-meter-scale">
                                    <span>Common</span>
                                    <span>Legendary</span>
                                    <span>Mythic</span>
                                </div>
                            </div>

                            {/* Override section — collapsible */}
                            <details style={{ marginBottom: 'var(--space-lg)' }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    fontSize: 'var(--font-sm)',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    padding: '8px 0',
                                    userSelect: 'none',
                                }}>
                                    ✏️ Override Details (if AI got it wrong)
                                </summary>
                                <div style={{ ...fieldGroupStyle, marginTop: 'var(--space-sm)' }}>
                                    {renderCarFormFields()}
                                </div>
                            </details>

                            {/* Location Section */}
                            {renderLocation()}

                            {/* Error */}
                            {error && (
                                <div style={{ padding: '10px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {renderSaveActions()}
                        </div>
                    )}

                    {/* ════════════════════════════════════════════════ */}
                    {/* Result Card — Low Confidence (<90%) */}
                    {/* ════════════════════════════════════════════════ */}
                    {result && !isHighConfidence && (
                        <div className="analysis-result animate-fade-in-up" style={{ '--rarity-color': 'var(--accent-orange)' }}>
                            <div className="result-header">
                                <h2>⚠️ Unable to Spot</h2>
                                {isAdmin && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className="result-confidence" style={{ background: 'var(--accent-orange-dim)', color: 'var(--accent-orange)' }}>
                                            {result.confidence}% confident
                                        </span>
                                        <span style={{
                                            fontSize: 'var(--font-xs)',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-full)',
                                            background: result.source === 'gemini' ? 'var(--accent-blue-dim)' : 'var(--accent-orange-dim)',
                                            color: result.source === 'gemini' ? 'var(--accent-blue)' : 'var(--accent-orange)',
                                            fontWeight: 600,
                                        }}>
                                            {result.source === 'gemini' ? '🤖 Gemini AI' : '🎲 Demo Mode'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{
                                padding: 'var(--space-md)',
                                background: 'var(--accent-orange-dim)',
                                border: '1px solid rgba(255, 152, 0, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: 'var(--space-lg)',
                                fontSize: 'var(--font-sm)',
                            }}>
                                <p style={{ color: 'var(--accent-orange)', fontWeight: 700, marginBottom: '4px' }}>
                                    Car not confidently identified
                                </p>
                                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                    The AI's best guess is shown below. Please verify and correct the details before saving.
                                </p>
                            </div>

                            {/* AI's guess (read-only display) */}
                            {result.car.make !== 'Unknown' && (
                                <div style={{
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--space-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: 'var(--font-sm)',
                                }}>
                                    <span style={{ color: 'var(--text-muted)' }}>AI's guess:</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {result.car.make} {result.car.model} ({result.car.year})
                                    </span>
                                </div>
                            )}

                            {/* Editable override form — always visible for low confidence */}
                            <div style={{ marginBottom: 'var(--space-lg)' }}>
                                <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 700, marginBottom: 'var(--space-md)', color: 'var(--text-primary)' }}>
                                    ✏️ Enter Car Details
                                </h4>
                                <div style={fieldGroupStyle}>
                                    {renderCarFormFields(true)}
                                </div>
                            </div>

                            {/* Location Section */}
                            {renderLocation()}

                            {/* Error */}
                            {error && (
                                <div style={{ padding: '10px', background: 'var(--accent-red-dim)', borderRadius: 'var(--radius-md)', color: 'var(--accent-red)', fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 'var(--space-md)', textAlign: 'center' }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {renderSaveActions()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ───── Shared render functions ─────

    function renderCarFormFields(showRequired = false) {
        const req = showRequired ? ' *' : '';
        const isOtherMake = overrideMake === '__OTHER__';
        const isOtherModel = overrideModel === '__OTHER__';

        // Get effective make/model for display and saving
        const effectiveMakeValue = isOtherMake ? customMake : overrideMake;
        const effectiveModelValue = isOtherModel ? customModel : overrideModel;

        return (
            <>
                {/* Row 1: Year + Make */}
                <div>
                    <label style={labelStyle}>Year{req}</label>
                    <select
                        style={inputStyle}
                        value={overrideYear}
                        onChange={(e) => {
                            setOverrideYear(e.target.value);
                            setOverrideModel('');
                            setCustomModel('');
                        }}
                    >
                        <option value="">Select year...</option>
                        {yearsList.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Make{req}</label>
                    {isOtherMake ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                                style={{ ...inputStyle, flex: 1 }}
                                value={customMake}
                                onChange={(e) => setCustomMake(e.target.value)}
                                placeholder="Type make name..."
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => { setOverrideMake(''); setCustomMake(''); setOverrideModel(''); setCustomModel(''); }}
                                style={{ ...inputStyle, width: 'auto', cursor: 'pointer', padding: '8px 12px', flexShrink: 0 }}
                                title="Back to dropdown"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <select
                            style={inputStyle}
                            value={overrideMake}
                            onChange={(e) => {
                                setOverrideMake(e.target.value);
                                setOverrideModel('');
                                setCustomModel('');
                            }}
                        >
                            <option value="">Select make...</option>
                            {makesList.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="__OTHER__">── Other (type custom) ──</option>
                        </select>
                    )}
                </div>
                {/* Row 2: Model + Category */}
                <div>
                    <label style={labelStyle}>Model{req}</label>
                    {isOtherMake || isOtherModel ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                                style={{ ...inputStyle, flex: 1 }}
                                value={isOtherModel ? customModel : overrideModel}
                                onChange={(e) => {
                                    if (isOtherModel) setCustomModel(e.target.value);
                                    else setOverrideModel(e.target.value);
                                }}
                                placeholder="Type model name..."
                                autoFocus={isOtherModel}
                            />
                            {isOtherModel && !isOtherMake && (
                                <button
                                    type="button"
                                    onClick={() => { setOverrideModel(''); setCustomModel(''); }}
                                    style={{ ...inputStyle, width: 'auto', cursor: 'pointer', padding: '8px 12px', flexShrink: 0 }}
                                    title="Back to dropdown"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ) : (
                        <select
                            style={inputStyle}
                            value={overrideModel}
                            onChange={(e) => setOverrideModel(e.target.value)}
                        >
                            <option value="">{modelsList.length > 0 ? 'Select model...' : (overrideYear && overrideMake ? 'No models for this year' : 'Select year & make first')}</option>
                            {modelsList.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                            <option value="__OTHER__">── Other (type custom) ──</option>
                        </select>
                    )}
                </div>
                <div>
                    <label style={labelStyle}>Category</label>
                    <select style={inputStyle} value={overrideCategory} onChange={(e) => setOverrideCategory(e.target.value)}>
                        <option value="">Select type...</option>
                        {CAR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </>
        );
    }

    function renderLocation() {
        return (
            <div style={{
                padding: 'var(--space-md)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-lg)',
            }}>
                {locationLoading ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="scan-spinner" style={{ width: 14, height: 14 }} /> Reading location from photo...
                    </div>
                ) : photoLocation ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                                fontSize: 'var(--font-xs)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--accent-green-dim)',
                                color: 'var(--accent-green)',
                                fontWeight: 600,
                            }}>
                                📍 GPS Detected
                            </span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{photoLocation.city}</span>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', display: 'block' }}>
                            {photoLocation.lat.toFixed(4)}, {photoLocation.lng.toFixed(4)}
                        </span>
                    </div>
                ) : (
                    <div>
                        <label style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            📍 Where was this spotted? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(no GPS data found)</span>
                        </label>
                        <input
                            type="text"
                            style={inputStyle}
                            placeholder="e.g. Pacific Palisades, CA"
                            value={manualLocation}
                            onChange={(e) => setManualLocation(e.target.value)}
                            id="manual-location"
                        />
                    </div>
                )}
            </div>
        );
    }

    function renderSaveActions() {
        return (
            <div className="result-actions">
                {!saved ? (
                    <button className="btn btn-primary" onClick={handleSave} id="save-spot-btn">
                        💾 Save to Collection
                    </button>
                ) : (
                    <div className="saved-message">
                        ✅ Saved to your collection!
                    </div>
                )}
                <button className="btn btn-ghost" onClick={handleReset}>
                    📸 Spot Another Car
                </button>
            </div>
        );
    }
}
