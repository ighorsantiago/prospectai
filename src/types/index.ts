export interface Business {
    id: string
    name: string
    category: string
    address: string
    phone?: string
    website?: string
    rating?: number
    totalRatings?: number
    hasWebsite: boolean
    location: {
        lat: number
        lng: number
    }
}

export interface BusinessProfile {
    business: Business
    acceptanceProbability: number
    recommendedApproach: 'in_person' | 'whatsapp' | 'phone' | 'email'
    approachReason: string
}

export interface BusinessScript {
    salesPitch: string
    possibleObjections: string[]
    talkingPoints: string[]
}

export interface SearchFilters {
    region: string
    niche: string
    radius: number
    coordinates?: { lat: number; lng: number }
}

export interface FilterState {
    hasWebsite: 'all' | 'with' | 'without'
    minProbability: number
}
