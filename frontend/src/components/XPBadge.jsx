import { useState, useEffect } from 'react'
import { Trophy, Award, TrendingUp, Star, Sparkles } from 'lucide-react'
import { api } from '../lib/api'

export default function XPBadge({ compact = false }) {
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const resp = await api.get('/gamification/profile')
            setProfile(resp.data)
        } catch (err) {
            console.error('Failed to load gamification profile:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !profile) {
        return null
    }

    if (compact) {
        return (
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm">
                        <Star className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-900">
                            Level {profile.level}
                        </div>
                        <div className="text-xs text-gray-600">
                            {profile.xp} XP
                        </div>
                    </div>
                </div>

                {profile.badges && profile.badges.length > 0 && (
                    <div className="flex items-center gap-1 border-l border-indigo-200 pl-3">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold text-gray-900">{profile.badges.length}</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            {/* Level & Rank */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                        <Star className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">
                            Level {profile.level}
                        </div>
                        <div className="text-sm text-gray-600">
                            {profile.xp.toLocaleString()} XP
                        </div>
                    </div>
                </div>

                {profile.rank && (
                    <div className="text-center px-3 py-2 bg-amber-50 rounded-lg border border-amber-200">
                        <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                        <div className="text-xs font-semibold text-amber-900">
                            Rank #{profile.rank}
                        </div>
                    </div>
                )}
            </div>

            {/* XP Progress Bar */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">
                        Progress to Level {profile.level + 1}
                    </span>
                    <span className="text-xs text-gray-600">
                        {profile.xp_progress}/{profile.xp_needed} XP
                    </span>
                </div>
                <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${profile.progress_percentage}%` }}
                    />
                </div>
            </div>

            {/* Badges */}
            {profile.badges && profile.badges.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold text-gray-700">
                            Achievements ({profile.badges.length})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profile.badges.slice(0, 5).map((badge) => (
                            <div
                                key={badge.id}
                                className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-md border border-amber-200"
                                title={badge.description}
                            >
                                <span className="text-lg">{badge.icon}</span>
                                <span className="text-xs font-medium text-gray-900">{badge.name}</span>
                            </div>
                        ))}
                        {profile.badges.length > 5 && (
                            <div className="flex items-center justify-center px-2 py-1 bg-gray-100 rounded-md border border-gray-300">
                                <span className="text-xs font-medium text-gray-600">
                                    +{profile.badges.length - 5} more
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
