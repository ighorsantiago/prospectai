import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_KEY = process.env.GOOGLE_PLACES_KEY

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

    if (req.method === 'OPTIONS') return res.status(200).end()

    const { endpoint, ...params } = req.query

    if (!endpoint || typeof endpoint !== 'string') {
        return res.status(400).json({ error: 'Missing endpoint' })
    }

    const allowedEndpoints: Record<string, string> = {
        geocode: 'https://maps.googleapis.com/maps/api/geocode/json',
        nearbysearch: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        details: 'https://maps.googleapis.com/maps/api/place/details/json',
    }

    const baseUrl = allowedEndpoints[endpoint]
    if (!baseUrl) return res.status(400).json({ error: 'Invalid endpoint' })

    const queryParams = new URLSearchParams()
    queryParams.set('key', GOOGLE_KEY ?? '')

    Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string') queryParams.set(key, value)
    })

    try {
        const response = await fetch(`${baseUrl}?${queryParams.toString()}`)
        const data = await response.json()
        return res.status(200).json(data)
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch from Google API' })
    }
}
