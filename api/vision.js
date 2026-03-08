// Vercel Serverless Function — Google Cloud Vision API Proxy
// Keeps the API key server-side, never exposed to the client.

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Vision API key not configured on server' });
    }

    try {
        const { image, features } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        const requestBody = {
            requests: [
                {
                    image: { content: image },
                    features: features || [
                        { type: 'LABEL_DETECTION', maxResults: 20 },
                        { type: 'WEB_DETECTION', maxResults: 10 },
                        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                        { type: 'TEXT_DETECTION', maxResults: 20 },
                    ],
                },
            ],
        };

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                error: errorData?.error?.message || `Vision API error: ${response.status}`,
            });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        console.error('Vision proxy error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
