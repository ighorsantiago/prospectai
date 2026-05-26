import { useState } from 'react'
import { Search, MapPin, Tag, Radius } from 'lucide-react'
import { theme } from '../themes'
import type { SearchFilters } from '../types'

const NICHE_SUGGESTIONS = [
    'Barbearia', 'Salão de beleza', 'Manicure', 'Clínica estética',
    'Restaurante', 'Lanchonete', 'Padaria', 'Petshop',
    'Academia', 'Fisioterapia', 'Advocacia', 'Contabilidade',
]

interface SearchFormProps {
    onSearch: (filters: SearchFilters) => void
    loading: boolean
}

export default function SearchForm({ onSearch, loading }: SearchFormProps) {
    const [region, setRegion] = useState('')
    const [niche, setNiche] = useState('')
    const [radius, setRadius] = useState(1000)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const filtered = NICHE_SUGGESTIONS.filter(n =>
        n.toLowerCase().includes(niche.toLowerCase()) && niche.length > 0
    )

    function handleSubmit() {
        if (!region.trim() || !niche.trim()) return
        onSearch({ region, niche, radius })
    }

    return (
        <div
            className="rounded-2xl p-6 flex flex-col gap-5 border"
            style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
        >
            <h2 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
                Buscar negócios
            </h2>

            {/* Region */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm" style={{ color: theme.textSecondary }}>
                    Região
                </label>
                <div className="relative">
                    <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: theme.textMuted }}
                    />
                    <input
                        type="text"
                        placeholder="Ex: Barra da Tijuca, Rio de Janeiro"
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                        className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm border focus:outline-none"
                        style={{
                            backgroundColor: theme.bgInput,
                            borderColor: theme.border,
                            color: theme.textPrimary,
                        }}
                    />
                </div>
            </div>

            {/* Niche */}
            <div className="flex flex-col gap-1.5 relative">
                <label className="text-sm" style={{ color: theme.textSecondary }}>
                    Nicho
                </label>
                <div className="relative">
                    <Tag
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: theme.textMuted }}
                    />
                    <input
                        type="text"
                        placeholder="Ex: Barbearia, Salão de beleza..."
                        value={niche}
                        onChange={e => { setNiche(e.target.value); setShowSuggestions(true) }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm border focus:outline-none"
                        style={{
                            backgroundColor: theme.bgInput,
                            borderColor: theme.border,
                            color: theme.textPrimary,
                        }}
                    />
                </div>

                {showSuggestions && filtered.length > 0 && (
                    <ul
                        className="absolute top-full left-0 right-0 mt-1 rounded-lg border overflow-hidden z-10"
                        style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
                    >
                        {filtered.map(suggestion => (
                            <li
                                key={suggestion}
                                onClick={() => { setNiche(suggestion); setShowSuggestions(false) }}
                                className="px-4 py-2.5 text-sm cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ color: theme.textPrimary }}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Radius */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm flex items-center gap-2" style={{ color: theme.textSecondary }}>
                    <Radius size={14} />
                    Raio de busca: <span style={{ color: theme.accent }}>{(radius / 1000).toFixed(1)} km</span>
                </label>
                <input
                    type="range"
                    min={500}
                    max={5000}
                    step={500}
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="w-full accent-violet-600"
                />
                <div className="flex justify-between text-xs" style={{ color: theme.textMuted }}>
                    <span>0.5 km</span>
                    <span>5 km</span>
                </div>
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={loading || !region.trim() || !niche.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ backgroundColor: theme.accent, color: theme.textOnAccent }}
            >
                <Search size={16} />
                {loading ? 'Analisando...' : 'Prospectar'}
            </button>
        </div>
    )
}
