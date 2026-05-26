import { useState } from 'react'
import { MapPin, Phone, Globe, User, MessageCircle, ChevronDown, ChevronUp, Loader } from 'lucide-react'
import { theme } from '../themes'
import type { Business, BusinessProfile, BusinessScript } from '../types'

interface BusinessCardProps {
    business: Business
    rank: number
    onFetchProfile: (business: Business) => Promise<BusinessProfile>
    onFetchScript: (business: Business) => Promise<BusinessScript>
}

const approachConfig = {
    in_person: { label: 'Visita pessoal', icon: User },
    whatsapp: { label: 'WhatsApp', icon: MessageCircle },
    phone: { label: 'Telefone', icon: Phone },
    email: { label: 'E-mail', icon: Globe },
}

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 70 ? theme.scoreHigh : score >= 40 ? theme.scoreMedium : theme.scoreLow
    return (
        <div
            className="flex items-center justify-center w-12 h-12 rounded-full font-bold text-sm shrink-0"
            style={{ backgroundColor: color + '22', color }}
        >
            {score}%
        </div>
    )
}

export default function BusinessCard({ business, rank, onFetchProfile, onFetchScript }: BusinessCardProps) {
    const [profile, setProfile] = useState<BusinessProfile | null>(null)
    const [script, setScript] = useState<BusinessScript | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(false)
    const [loadingScript, setLoadingScript] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleAnalyze() {
        if (profile) { setExpanded(prev => !prev); return }
        setLoadingProfile(true)
        setExpanded(true)
        setError(null)
        try {
            const result = await onFetchProfile(business)
            setProfile(result)
        } catch (err: any) {
            setError(err.message ?? 'Erro ao analisar negócio.')
        } finally {
            setLoadingProfile(false)
        }
    }

    async function handleScript() {
        if (script) return
        setLoadingScript(true)
        setError(null)
        try {
            const result = await onFetchScript(business)
            setScript(result)
        } catch (err: any) {
            setError(err.message ?? 'Erro ao gerar script.')
        } finally {
            setLoadingScript(false)
        }
    }

    const approach = profile ? approachConfig[profile.recommendedApproach] : null
    const ApproachIcon = approach?.icon

    return (
        <div
            className="rounded-xl border flex flex-col"
            style={{ backgroundColor: theme.bgSecondary, borderColor: theme.border }}
        >
            {/* Header */}
            <div className="p-5 flex gap-4">
                <div
                    className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: theme.bgCard, color: theme.textMuted }}
                >
                    {rank}
                </div>

                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <h3 className="font-semibold" style={{ color: theme.textPrimary }}>
                        {business.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-sm" style={{ color: theme.textSecondary }}>
                        <MapPin size={13} style={{ color: theme.textMuted }} />
                        <span className="truncate">{business.address}</span>
                    </div>

                    {business.phone && (
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: theme.textSecondary }}>
                            <Phone size={13} style={{ color: theme.textMuted }} />
                            {business.phone}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                        {business.hasWebsite ? (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.success + '22', color: theme.success }}>
                                Tem site
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.danger + '22', color: theme.danger }}>
                                Sem site
                            </span>
                        )}
                        {business.rating && (
                            <span className="text-xs" style={{ color: theme.textMuted }}>
                                ⭐ {business.rating} ({business.totalRatings})
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    {profile && <ScoreBadge score={profile.acceptanceProbability} />}
                    <button
                        onClick={handleAnalyze}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                        style={{ backgroundColor: theme.accent + '22', color: theme.accent }}
                    >
                        {loadingProfile
                            ? <Loader size={12} className="animate-spin" />
                            : expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        }
                        {profile ? (expanded ? 'Recolher' : 'Ver análise') : 'Analisar'}
                    </button>
                </div>
            </div>

            {/* Profile expanded */}
            {expanded && (
                <div
                    className="px-5 pb-5 flex flex-col gap-4 border-t pt-4"
                    style={{ borderColor: theme.border }}
                >
                    {loadingProfile ? (
                        <div className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
                            <Loader size={14} className="animate-spin" />
                            Analisando negócio...
                        </div>
                    ) : error ? (
                        <p className="text-sm" style={{ color: theme.danger }}>{error}</p>
                    ) : profile && (
                        <>
                            {/* Approach */}
                            {approach && ApproachIcon && (
                                <div className="flex items-start gap-3">
                                    <div
                                        className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg shrink-0"
                                        style={{ backgroundColor: theme.accent + '22', color: theme.accent }}
                                    >
                                        <ApproachIcon size={13} />
                                        {approach.label}
                                    </div>
                                    <p className="text-sm mt-1.5" style={{ color: theme.textSecondary }}>
                                        {profile.approachReason}
                                    </p>
                                </div>
                            )}

                            {/* Script button */}
                            {!script && (
                                <button
                                    onClick={handleScript}
                                    disabled={loadingScript}
                                    className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ borderColor: theme.accent, color: theme.accent }}
                                >
                                    {loadingScript
                                        ? <><Loader size={14} className="animate-spin" /> Gerando script...</>
                                        : 'Gerar script de vendas'
                                    }
                                </button>
                            )}

                            {/* Script */}
                            {script && (
                                <div className="flex flex-col gap-4">
                                    <div
                                        className="rounded-xl p-4 text-sm leading-relaxed border whitespace-pre-wrap"
                                        style={{ backgroundColor: theme.bgCard, borderColor: theme.border, color: theme.textSecondary }}
                                    >
                                        {script.salesPitch}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                                            Argumentos de venda
                                        </p>
                                        {script.talkingPoints.map((point, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                                <span style={{ color: theme.success }}>✓</span>
                                                {point}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <p className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                                            Possíveis objeções
                                        </p>
                                        {script.possibleObjections.map((obj, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm" style={{ color: theme.textSecondary }}>
                                                <span style={{ color: theme.warning }}>⚠</span>
                                                {obj}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
