// ═══════════════════════════════════════════════════
// EXIF GPS Extraction — Read location from photo metadata
// ═══════════════════════════════════════════════════

/**
 * Extract GPS coordinates from a photo's EXIF metadata.
 * Works directly with File objects in the browser — no external library needed.
 * Returns { lat, lng } or null if no GPS data found.
 */
export async function extractGPSFromPhoto(file) {
    try {
        const buffer = await file.arrayBuffer();
        const view = new DataView(buffer);

        // Check for JPEG SOI marker
        if (view.getUint16(0) !== 0xFFD8) return null;

        let offset = 2;
        while (offset < view.byteLength - 1) {
            const marker = view.getUint16(offset);

            // APP1 marker (EXIF)
            if (marker === 0xFFE1) {
                const exifData = parseEXIF(view, offset + 4);
                if (exifData) return exifData;
                return null;
            }

            // Skip to next marker
            if (marker === 0xFFDA) break; // Start of scan — no more metadata
            const size = view.getUint16(offset + 2);
            offset += 2 + size;
        }

        return null;
    } catch (err) {
        console.warn('EXIF parsing failed:', err);
        return null;
    }
}

function parseEXIF(view, start) {
    // Check for "Exif\0\0"
    const exifHeader = String.fromCharCode(
        view.getUint8(start), view.getUint8(start + 1),
        view.getUint8(start + 2), view.getUint8(start + 3)
    );
    if (exifHeader !== 'Exif') return null;

    const tiffStart = start + 6;
    const byteOrder = view.getUint16(tiffStart);
    const littleEndian = byteOrder === 0x4949; // "II" = little-endian

    // Verify TIFF magic number
    if (view.getUint16(tiffStart + 2, littleEndian) !== 0x002A) return null;

    const firstIFDOffset = view.getUint32(tiffStart + 4, littleEndian);

    // Parse IFD0 to find GPS IFD pointer
    const gpsIFDPointer = findGPSIFD(view, tiffStart, tiffStart + firstIFDOffset, littleEndian);
    if (!gpsIFDPointer) return null;

    // Parse GPS IFD
    return parseGPSIFD(view, tiffStart, gpsIFDPointer, littleEndian);
}

function findGPSIFD(view, tiffStart, ifdOffset, littleEndian) {
    try {
        const entries = view.getUint16(ifdOffset, littleEndian);
        for (let i = 0; i < entries; i++) {
            const entryOffset = ifdOffset + 2 + i * 12;
            const tag = view.getUint16(entryOffset, littleEndian);
            if (tag === 0x8825) { // GPSInfoIFDPointer
                return tiffStart + view.getUint32(entryOffset + 8, littleEndian);
            }
        }
    } catch (e) {
        // Offset out of bounds
    }
    return null;
}

function parseGPSIFD(view, tiffStart, gpsOffset, littleEndian) {
    try {
        const entries = view.getUint16(gpsOffset, littleEndian);
        let latRef = null, lngRef = null;
        let latValues = null, lngValues = null;

        for (let i = 0; i < entries; i++) {
            const entryOffset = gpsOffset + 2 + i * 12;
            const tag = view.getUint16(entryOffset, littleEndian);

            switch (tag) {
                case 0x0001: // GPSLatitudeRef (N/S)
                    latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                    break;
                case 0x0002: // GPSLatitude
                    latValues = readRationals(view, tiffStart, entryOffset, littleEndian, 3);
                    break;
                case 0x0003: // GPSLongitudeRef (E/W)
                    lngRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                    break;
                case 0x0004: // GPSLongitude
                    lngValues = readRationals(view, tiffStart, entryOffset, littleEndian, 3);
                    break;
            }
        }

        if (latValues && lngValues) {
            let lat = latValues[0] + latValues[1] / 60 + latValues[2] / 3600;
            let lng = lngValues[0] + lngValues[1] / 60 + lngValues[2] / 3600;

            if (latRef === 'S') lat = -lat;
            if (lngRef === 'W') lng = -lng;

            // Sanity check
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return { lat, lng };
            }
        }
    } catch (e) {
        // Parse error
    }
    return null;
}

function readRationals(view, tiffStart, entryOffset, littleEndian, count) {
    const valueOffset = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
    const values = [];
    for (let i = 0; i < count; i++) {
        const num = view.getUint32(valueOffset + i * 8, littleEndian);
        const den = view.getUint32(valueOffset + i * 8 + 4, littleEndian);
        values.push(den ? num / den : 0);
    }
    return values;
}

/**
 * Reverse geocode GPS coordinates to a city name using OpenStreetMap Nominatim.
 * Free, no API key needed.
 */
export async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
            { headers: { 'Accept-Language': 'en' } }
        );
        if (!response.ok) return null;

        const data = await response.json();
        const addr = data.address || {};

        // Build a readable city name
        const city = addr.city || addr.town || addr.village || addr.hamlet || addr.county || '';
        const state = addr.state || '';
        const country = addr.country_code?.toUpperCase() || '';

        if (city && state && country === 'US') {
            // US format: "City, ST"
            const stateAbbr = US_STATE_ABBRS[state] || state;
            return `${city}, ${stateAbbr}`;
        }
        if (city && state) {
            return `${city}, ${state}`;
        }
        if (city) return city;
        if (data.display_name) {
            // Use first 2 parts of display name
            return data.display_name.split(',').slice(0, 2).map(s => s.trim()).join(', ');
        }

        return null;
    } catch (err) {
        console.warn('Reverse geocoding failed:', err);
        return null;
    }
}

const US_STATE_ABBRS = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY',
};
