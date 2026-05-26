import { useState } from 'react'
import { Search, MapPin, Tag, Radius, LocateFixed, Loader } from 'lucide-react'
import { theme } from '../themes'
import type { SearchFilters } from '../types'

const STATES = [
    { code: 'AC', name: 'Acre' },
    { code: 'AL', name: 'Alagoas' },
    { code: 'AP', name: 'Amapá' },
    { code: 'AM', name: 'Amazonas' },
    { code: 'BA', name: 'Bahia' },
    { code: 'CE', name: 'Ceará' },
    { code: 'DF', name: 'Distrito Federal' },
    { code: 'ES', name: 'Espírito Santo' },
    { code: 'GO', name: 'Goiás' },
    { code: 'MA', name: 'Maranhão' },
    { code: 'MT', name: 'Mato Grosso' },
    { code: 'MS', name: 'Mato Grosso do Sul' },
    { code: 'MG', name: 'Minas Gerais' },
    { code: 'PA', name: 'Pará' },
    { code: 'PB', name: 'Paraíba' },
    { code: 'PR', name: 'Paraná' },
    { code: 'PE', name: 'Pernambuco' },
    { code: 'PI', name: 'Piauí' },
    { code: 'RJ', name: 'Rio de Janeiro' },
    { code: 'RN', name: 'Rio Grande do Norte' },
    { code: 'RS', name: 'Rio Grande do Sul' },
    { code: 'RO', name: 'Rondônia' },
    { code: 'RR', name: 'Roraima' },
    { code: 'SC', name: 'Santa Catarina' },
    { code: 'SP', name: 'São Paulo' },
    { code: 'SE', name: 'Sergipe' },
    { code: 'TO', name: 'Tocantins' },
]

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
    const [state, setState] = useState('RJ')
    const [niche, setNiche] = useState('')
    const [radius, setRadius] = useState(1000)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>()
    const [locating, setLocating] = useState(false)

    const filtered = NICHE_SUGGESTIONS.filter(n =>
        n.toLowerCase().includes(niche.toLowerCase()) && niche.length > 0
    )

    function handleRegionChange(value: string) {
        setRegion(value)
        setCoordinates(undefined) // limpa coordenadas ao editar manualmente
    }

    function handleLocateMe() {
        if (!navigator.geolocation) return
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                setRegion('Minha localização')
                setLocating(false)
            },
            () => {
                setLocating(false)
                alert('Não foi possível obter sua localização. Verifique as permissões do navegador.')
            }
        )
    }

    function handleSubmit() {
        if (!region.trim() || !niche.trim()) return
        onSearch({ region, niche, radius, state, coordinates })
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
                <div className="flex items-center justify-between">
                    <label className="text-sm" style={{ color: theme.textSecondary }}>
                        Região
                    </label>
                    <button
                        type="button"
                        onClick={handleLocateMe}
                        disabled={locating}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{ backgroundColor: theme.accent + '22', color: theme.accent }}
                    >
                        {locating
                            ? <Loader size={11} className="animate-spin" />
                            : <LocateFixed size={11} />
                        }
                        Perto de mim
                    </button>
                </div>
                <div className="relative">
                    <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: coordinates ? theme.accent : theme.textMuted }}
                    />
                    <input
                        type="text"
                        placeholder="Ex: Anil, Rio de Janeiro"
                        value={region}
                        onChange={e => handleRegionChange(e.target.value)}
                        className="w-full rounded-lg pl-9 pr-4 py-2.5 text-sm border focus:outline-none"
                        style={{
                            backgroundColor: theme.bgInput,
                            borderColor: coordinates ? theme.accent + '66' : theme.border,
                            color: theme.textPrimary,
                        }}
                    />
                </div>
            </div>

            {/* State */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm" style={{ color: theme.textSecondary }}>
                    Estado
                </label>
                <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none appearance-none"
                    style={{
                        backgroundColor: theme.bgInput,
                        borderColor: theme.border,
                        color: theme.textPrimary,
                    }}
                >
                    {STATES.map(s => (
                        <option key={s.code} value={s.code}
                            style={{ backgroundColor: '#1A1D27', color: '#F4F4F5' }}
                        >
                            {s.code} — {s.name}
                        </option>
                    ))}
                </select>
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
