import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, TrendingUp, Crown, Star } from 'lucide-react'
import { api } from '../lib/api'
import { getCurrentUser } from '../lib/auth'

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState('all')
    const [userRank, setUserRank] = useState(null)
    const [userEntry, setUserEntry] = useState(null)

    const currentUser = getCurrentUser()

    useEffect(() => {
        loadLeaderboard()
    }, [timeframe])

    const loadLeaderboard = async () => {
        setLoading(true)
        try {
            const resp = await api.get(`/gamification/leaderboard?timeframe=${timeframe}`)
            setLeaderboard(resp.data.leaderboard)
            setUserRank(resp.data.user_rank)
            setUserEntry(resp.data.user_entry)
        } catch (err) {
            console.error('Failed to load leaderboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        if (rank === 2) return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />
        if (rank === 3) return <Medal className="h-6 w-6 text-amber-600 fill-amber-600" />
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }

    const getRankColor = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
        if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
        if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
        return 'bg-white border-gray-200'
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading leaderboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg">
                            <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
                            <p className="text-gray-600">Top performers and rankings</p>
                        </div>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTimeframe('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => setTimeframe('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === 'monthly'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setTimeframe('weekly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeframe === 'weekly'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            This Week
                        </button>
                    </div>
                </div>

                {/* User's Rank Card */}
                {userEntry && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white font-bold">
                                    {getRankIcon(userEntry.rank)}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Your Rank</div>
                                    <div className="text-sm text-gray-600">{userEntry.name}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-indigo-900">
                                    #{userEntry.rank}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {userEntry.xp.toLocaleString()} XP
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        XP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Badges
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {leaderboard.map((entry) => (
                                    <tr
                                        key={entry.userId}
                                        className={`${getRankColor(entry.rank)} ${entry.userId === currentUser?.id ? 'bg-indigo-50' : ''
                                            } hover:bg-gray-50 transition-colors`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-12">
                                                {getRankIcon(entry.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold shadow-sm">
                                                    {entry.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{entry.name}</div>
                                                    <div className="text-sm text-gray-500">{entry.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                                                <span className="font-semibold text-gray-900">{entry.level}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {entry.xp.toLocaleString()} XP
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <Award className="h-4 w-4 text-amber-500" />
                                                <span className="text-sm font-medium text-gray-900">{entry.badges}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {leaderboard.length === 0 && (
                        <div className="text-center py-12">
                            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No rankings yet. Start practicing to climb the leaderboard!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
