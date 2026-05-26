import { theme } from '../themes'
import type { FilterState } from '../types'

interface FilterBarProps {
    filters: FilterState
    onChange: (f: FilterState) => void
    hasAnalyzed: boolean
}

const websiteOptions: { value: FilterState['hasWebsite']; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'without', label: 'Sem site' },
    { value: 'with', label: 'Tem site' },
]

export default function FilterBar({ filters, onChange, hasAnalyzed }: FilterBarProps) {
    return (
        <div
            className="rounded-xl border px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3"
            style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
        >
            {/* Filtro: site */}
            <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: theme.textMuted }}>Site:</span>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: theme.border }}>
                    {websiteOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onChange({ ...filters, hasWebsite: opt.value })}
                            className="px-3 py-1 text-xs transition-colors"
                            style={{
                                backgroundColor: filters.hasWebsite === opt.value ? theme.accent : 'transparent',
                                color: filters.hasWebsite === opt.value ? theme.textOnAccent : theme.textSecondary,
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filtro: probabilidade mínima — só aparece se algum card foi analisado */}
            {hasAnalyzed && (
                <div className="flex items-center gap-2 flex-1 min-w-48">
                    <span className="text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>
                        Prob. mínima:
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={90}
                        step={10}
                        value={filters.minProbability}
                        onChange={e => onChange({ ...filters, minProbability: Number(e.target.value) })}
                        className="flex-1 accent-violet-600"
                    />
                    <span
                        className="text-xs font-semibold w-8 text-right"
                        style={{ color: filters.minProbability > 0 ? theme.accent : theme.textMuted }}
                    >
                        {filters.minProbability > 0 ? `${filters.minProbability}%` : 'off'}
                    </span>
                </div>
            )}
        </div>
    )
}
