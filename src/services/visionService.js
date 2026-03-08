// ═══════════════════════════════════════════════════
// Gemini API — AI Car Identification Service
// ═══════════════════════════════════════════════════

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Convert a File object to a base64 string (without the data URI prefix)
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove the data URI prefix (e.g. "data:image/jpeg;base64,")
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Get the MIME type from a File object
 */
function getMimeType(file) {
    return file.type || 'image/jpeg';
}

/**
 * The prompt sent to Gemini to identify cars in photos.
 * Asks for structured JSON output for reliable parsing.
 */
const CAR_IDENTIFICATION_PROMPT = `You are an expert car identification AI. Analyze this photo and identify the car.

Respond with ONLY a valid JSON object (no markdown, no code fences, no explanation). Use this exact format:

{
  "identified": true,
  "make": "Manufacturer name",
  "model": "Model name",
  "year": 2024,
  "category": "one of: Hypercar, Supercar, Sports Car, Muscle Car, Luxury, Sedan, SUV, Truck, Hatchback, Convertible, Coupe, Electric, Classic, Race Car, Rally, Van, Other",
  "confidence": 85,
  "description": "Brief 1-sentence description of what you see"
}

Rules:
- "confidence" should be 0-100 reflecting how certain you are about the identification
- If the year is uncertain, give your best estimate
- If you cannot identify a car at all in the image, return: {"identified": false, "error": "reason"}
- Be as specific as possible with make and model
- For modified/tuned cars, identify the base car
- Category should match the car's primary type`;

/**
 * Call Google Gemini API to analyze a car photo.
 * Uses multimodal capabilities for accurate visual car identification.
 */
export async function analyzeWithVisionAPI(imageFile) {
    const base64Image = await fileToBase64(imageFile);
    const mimeType = getMimeType(imageFile);

    // Get API key — dev uses VITE env var, production would use serverless proxy
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY_MISSING');
    }

    const requestBody = {
        contents: [{
            parts: [
                { text: CAR_IDENTIFICATION_PROMPT },
                {
                    inline_data: {
                        mime_type: mimeType,
                        data: base64Image,
                    },
                },
            ],
        }],
        generationConfig: {
            temperature: 0.1,  // Low temperature for consistent, factual responses
            maxOutputTokens: 500,
        },
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the text response from Gemini
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
        throw new Error('No response from Gemini API');
    }

    return parseGeminiResponse(textResponse);
}

/**
 * Parse the Gemini response JSON and normalize it to our app format.
 */
function parseGeminiResponse(textResponse) {
    // Clean the response — Gemini sometimes wraps in markdown code fences
    let cleaned = textResponse.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (err) {
        console.error('Failed to parse Gemini response:', textResponse);
        throw new Error('Failed to parse AI response');
    }

    // Handle "not identified" case
    if (!parsed.identified) {
        return {
            identified: false,
            error: parsed.error || 'Could not identify a car in this photo.',
        };
    }

    // Normalize to our app's expected format
    return {
        identified: true,
        car: {
            id: `gemini-${Date.now()}`,
            make: parsed.make || 'Unknown',
            model: parsed.model || 'Unknown Model',
            year: parsed.year || new Date().getFullYear(),
            rarity: 15, // Will be recalculated by vehicleDataService
            category: parsed.category || 'Car',
            image: null, // Will use the uploaded photo
        },
        confidence: Math.min(100, Math.max(0, parsed.confidence || 75)),
        description: parsed.description || null,
        rawResponse: parsed,
    };
}
