import { useState, useCallback } from 'react';
import type { Business, BusinessProfile, BusinessScript, SearchFilters } from '../types';

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function fetchBusinesses(filters: SearchFilters): Promise<Business[]> {
    const { region, niche, radius } = filters

    const geoRes = await fetch(
        `/api/places?endpoint=geocode&address=${encodeURIComponent(region)}`
    );
    const geoData = await geoRes.json()
    if (!geoData.results?.length) throw new Error('Região não encontrada.');
    const { lat, lng } = geoData.results[0].geometry.location;

    const placesRes = await fetch(
        `/api/places?endpoint=nearbysearch&location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(niche)}&language=pt-BR`
    );
    const placesData = await placesRes.json();
    if (!placesData.results?.length) return [];

    const businesses: Business[] = await Promise.all(
        placesData.results.slice(0, 10).map(async (place: any) => {
            const detailRes = await fetch(
                `/api/places?endpoint=details&place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry&language=pt-BR`
            );
            const detailData = await detailRes.json();
            const d = detailData.result;

            return {
                id: place.place_id,
                name: d.name ?? place.name,
                category: niche,
                address: d.formatted_address ?? place.vicinity,
                phone: d.formatted_phone_number,
                website: d.website,
                rating: d.rating,
                totalRatings: d.user_ratings_total,
                hasWebsite: !!d.website,
                location: {
                    lat: d.geometry?.location.lat ?? lat,
                    lng: d.geometry?.location.lng ?? lng,
                },
            }
        })
    )

    return businesses.sort((a, b) =>
        distanceKm(lat, lng, a.location.lat, a.location.lng) -
        distanceKm(lat, lng, b.location.lat, b.location.lng)
    );
}

async function fetchProfile(business: Business): Promise<BusinessProfile> {
    const prompt = `Você é um especialista em vendas B2B para pequenos negócios no Brasil.

Analise este negócio e retorne APENAS um JSON válido, sem markdown:

Negócio:
- Nome: ${business.name}
- Categoria: ${business.category}
- Endereço: ${business.address}
- Telefone: ${business.phone ?? 'não informado'}
- Site: ${business.hasWebsite ? business.website : 'não tem site'}
- Avaliação Google: ${business.rating ?? 'sem avaliação'} (${business.totalRatings ?? 0} avaliações)

Retorne exatamente este JSON:
{
  "acceptanceProbability": <número de 0 a 100>,
  "recommendedApproach": <"in_person" | "whatsapp" | "phone" | "email">,
  "approachReason": "<motivo em uma frase curta>"
}`;

    const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return {
        business,
        acceptanceProbability: result.acceptanceProbability,
        recommendedApproach: result.recommendedApproach,
        approachReason: result.approachReason,
    }
}

async function fetchScript(business: Business): Promise<BusinessScript> {
    const prompt = `Você é um especialista em vendas B2B para pequenos negócios no Brasil.

Crie um script de vendas para este negócio. Retorne APENAS um JSON válido, sem markdown:

Negócio:
- Nome: ${business.name}
- Categoria: ${business.category}
- Endereço: ${business.address}
- Tem site: ${business.hasWebsite ? 'sim' : 'não'}

O produto sendo vendido é um site profissional com agendamento online e painel de controle.

Retorne exatamente este JSON:
{
  "salesPitch": "<script completo em português brasileiro informal, 3-4 parágrafos>",
  "possibleObjections": ["<objeção 1>", "<objeção 2>", "<objeção 3>"],
  "talkingPoints": ["<argumento 1>", "<argumento 2>", "<argumento 3>"]
}`;

    const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
}

export function useProspect() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (filters: SearchFilters) => {
        setLoading(true);
        setError(null);
        setBusinesses([]);

        try {
            const results = await fetchBusinesses(filters)
            if (!results.length) {
                setError('Nenhum negócio encontrado nessa região.')
                return
            }
            setBusinesses(results)
        } catch (err: any) {
            setError(err.message ?? 'Erro ao buscar negócios.')
        } finally {
            setLoading(false)
        }
    }, []);

    return { businesses, loading, error, search, fetchProfile, fetchScript }
}
