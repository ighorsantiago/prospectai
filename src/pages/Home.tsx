import { useState, useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { theme } from '../themes'
import { useProspect } from '../hooks/useProspect'
import SearchForm from '../components/SearchForm'
import BusinessCard from '../components/BusinessCard'
import FilterBar from '../components/FilterBar'
import type { BusinessProfile, FilterState } from '../types'

export default function Home() {
    const { businesses, loading, error, search, fetchProfile, fetchScript } = useProspect()

    // Perfis analisados elevados dos cards para cá, para poder filtrar
    const [profiles, setProfiles] = useState<Record<string, BusinessProfile>>({})
    const [filters, setFilters] = useState<FilterState>({ hasWebsite: 'all', minProbability: 0 })

    function handleProfileFetched(businessId: string, profile: BusinessProfile) {
        setProfiles(prev => ({ ...prev, [businessId]: profile }))
    }

    const hasAnalyzed = Object.keys(profiles).length > 0

    const filteredBusinesses = useMemo(() => {
        return businesses.filter(b => {
            // Filtro por site
            if (filters.hasWebsite === 'with' && !b.hasWebsite) return false
            if (filters.hasWebsite === 'without' && b.hasWebsite) return false

            // Filtro por probabilidade — só afeta cards já analisados
            if (filters.minProbability > 0) {
                const profile = profiles[b.id]
                if (profile && profile.acceptanceProbability < filters.minProbability) return false
            }

            return true
        })
    }, [businesses, filters, profiles])

    const hiddenCount = businesses.length - filteredBusinesses.length

    return (
        <div className="min-h-screen" style={{ backgroundColor: theme.bgPrimary }}>
            <header
                className="border-b px-6 py-4 flex items-center gap-3"
                style={{ borderColor: theme.border, backgroundColor: theme.bgSecondary }}
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: theme.accent }}
                >
                    <Sparkles size={16} style={{ color: theme.textOnAccent }} />
                </div>
                <div>
                    <h1 className="font-bold text-sm" style={{ color: theme.textPrimary }}>
                        ProspectAI
                    </h1>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                        Prospecta aí · Sant.IA.Go
                    </p>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <SearchForm onSearch={search} loading={loading} />
                </div>

                <div className="md:col-span-2 flex flex-col gap-4">
                    {/* Estado vazio */}
                    {!loading && !error && businesses.length === 0 && (
                        <div
                            className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-3"
                            style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
                        >
                            <Sparkles size={32} style={{ color: theme.textMuted }} />
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                Busque uma região e nicho para começar
                            </p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div
                            className="rounded-2xl border flex flex-col items-center justify-center py-20 gap-3"
                            style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
                        >
                            <div
                                className="w-8 h-8 rounded-full border-2 animate-spin"
                                style={{ borderColor: theme.accent, borderTopColor: 'transparent' }}
                            />
                            <p className="text-sm" style={{ color: theme.textMuted }}>
                                Mapeando negócios...
                            </p>
                        </div>
                    )}

                    {/* Erro */}
                    {error && (
                        <div
                            className="rounded-2xl border px-5 py-4 text-sm"
                            style={{ backgroundColor: theme.danger + '11', borderColor: theme.danger + '44', color: theme.danger }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Resultados */}
                    {!loading && businesses.length > 0 && (
                        <>
                            <FilterBar
                                filters={filters}
                                onChange={f => setFilters(f)}
                                hasAnalyzed={hasAnalyzed}
                            />

                            <div className="flex items-center justify-between">
                                <p className="text-sm" style={{ color: theme.textMuted }}>
                                    {filteredBusinesses.length} negócio{filteredBusinesses.length !== 1 ? 's' : ''} encontrado{filteredBusinesses.length !== 1 ? 's' : ''}
                                    {hiddenCount > 0 && (
                                        <span style={{ color: theme.textMuted }}>
                                            {' '}· {hiddenCount} ocultado{hiddenCount !== 1 ? 's' : ''} pelo filtro
                                        </span>
                                    )}
                                </p>
                            </div>

                            {filteredBusinesses.map((business, index) => (
                                <BusinessCard
                                    key={business.id}
                                    business={business}
                                    rank={index + 1}
                                    onFetchProfile={fetchProfile}
                                    onFetchScript={fetchScript}
                                    onProfileFetched={handleProfileFetched}
                                />
                            ))}

                            {filteredBusinesses.length === 0 && (
                                <div
                                    className="rounded-2xl border flex flex-col items-center justify-center py-12 gap-2"
                                    style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
                                >
                                    <p className="text-sm" style={{ color: theme.textMuted }}>
                                        Nenhum resultado para os filtros aplicados
                                    </p>
                                    <button
                                        onClick={() => setFilters({ hasWebsite: 'all', minProbability: 0 })}
                                        className="text-xs underline"
                                        style={{ color: theme.accent }}
                                    >
                                        Limpar filtros
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
