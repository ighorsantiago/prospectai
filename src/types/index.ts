export interface Business {
    id: string
    name: string
    category: string
    address: string
    phone?: string
    website?: string
    instagram?: string
    rating?: number
    totalRatings?: number
    hasWebsite: boolean
    hasSocialMedia: boolean
    location: {
        lat: number
        lng: number
    }
}

export interface ProspectReport {
    business: Business
    acceptanceProbability: number     // 0-100
    recommendedApproach: 'in_person' | 'whatsapp' | 'phone' | 'email'
    approachReason: string
    salesPitch: string
    possibleObjections: string[]
    talkingPoints: string[]
}

export interface SearchFilters {
    region: string
    niche: string
    radius: number                    // metros
}
