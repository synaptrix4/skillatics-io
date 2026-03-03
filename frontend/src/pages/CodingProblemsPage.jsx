import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, CheckCircle2, Circle, ArrowRight, Search, ChevronDown, Zap } from 'lucide-react'
import { api } from '../lib/api'

export default function CodingProblemsPage() {
    const navigate = useNavigate()
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [difficultyFilter, setDifficultyFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProblems()
    }, [])

    const fetchProblems = async () => {
        try {
            const res = await api.get('/code/questions')
            setProblems(res.data)
        } catch (err) {
            console.error("Failed to fetch problems", err)
        } finally {
            setLoading(false)
        }
    }

    const filteredProblems = problems.filter(p => {
        if (difficultyFilter !== 'all') {
            if (difficultyFilter === 'easy' && p.difficulty > 1) return false
            if (difficultyFilter === 'medium' && (p.difficulty <= 1 || p.difficulty > 3)) return false
            if (difficultyFilter === 'hard' && p.difficulty <= 3) return false
        }
        if (searchTerm && !p.text?.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
    })

    const getDifficultyInfo = (diff) => {
        if (diff === 1) return { label: 'Easy', class: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
        if (diff <= 3) return { label: 'Medium', class: 'text-amber-600 bg-amber-50 border-amber-200' }
        return { label: 'Hard', class: 'text-red-600 bg-red-50 border-red-200' }
    }

    const solvedCount = problems.filter(p => p.status === 'Solved').length
    const easyCount = problems.filter(p => p.difficulty === 1).length
    const mediumCount = problems.filter(p => p.difficulty > 1 && p.difficulty <= 3).length
    const hardCount = problems.filter(p => p.difficulty > 3).length

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                                <Code2 className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Practice Problems</h1>
                                <p className="text-sm text-slate-500">Master algorithms with curated challenges</p>
                            </div>
                        </div>

                        <button
                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-semibold transition-all shadow-md shadow-orange-500/20"
                            onClick={() => navigate('/coding-practice/random')}
                        >
                            <Zap className="h-4 w-4" />
                            Random Problem
                        </button>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Total', value: problems.length, color: 'text-slate-900', bg: 'bg-white' },
                            { label: 'Easy', value: easyCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'Medium', value: mediumCount, color: 'text-amber-600', bg: 'bg-amber-50' },
                            { label: 'Hard', value: hardCount, color: 'text-red-600', bg: 'bg-red-50' },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} border border-slate-200/80 rounded-2xl p-4 text-center`}>
                                <div className={`text-2xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</div>
                                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                        />
                    </div>

                    {/* Difficulty Filter Pills */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
                        {['All', 'Easy', 'Medium', 'Hard'].map(f => (
                            <button
                                key={f}
                                onClick={() => setDifficultyFilter(f.toLowerCase())}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${difficultyFilter === f.toLowerCase()
                                    ? 'bg-orange-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-[auto_1fr_130px_120px_80px] items-center px-6 py-3 bg-slate-50/80 border-b border-slate-100">
                        <div className="w-10 text-xs font-bold text-slate-400 uppercase tracking-wider"></div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">Title</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Acceptance</div>
                        <div></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="grid grid-cols-[auto_1fr_130px_120px_80px] items-center px-6 py-4">
                                    <div className="w-10"><div className="h-5 w-5 bg-slate-100 rounded-full animate-pulse" /></div>
                                    <div className="pl-2"><div className="h-4 w-48 bg-slate-100 rounded-lg animate-pulse" /></div>
                                    <div><div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" /></div>
                                    <div><div className="h-4 w-12 bg-slate-100 rounded-lg animate-pulse" /></div>
                                    <div></div>
                                </div>
                            ))
                        ) : filteredProblems.length === 0 ? (
                            <div className="py-20 text-center">
                                <Code2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium">No problems match your filters</p>
                            </div>
                        ) : (
                            filteredProblems.map((problem, idx) => {
                                const diff = getDifficultyInfo(problem.difficulty)
                                const isSolved = problem.status === 'Solved'
                                return (
                                    <div
                                        key={problem._id}
                                        className="grid grid-cols-[auto_1fr_130px_120px_80px] items-center px-6 py-3.5 hover:bg-orange-50/40 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/coding-practice/${problem._id}`)}
                                    >
                                        {/* Status Icon */}
                                        <div className="w-10">
                                            {isSolved
                                                ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                : <Circle className="h-5 w-5 text-slate-200 group-hover:text-slate-300 transition-colors" />
                                            }
                                        </div>

                                        {/* Title */}
                                        <div className="pl-2">
                                            <span className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                                                {idx + 1}. {problem.text || problem.title}
                                            </span>
                                        </div>

                                        {/* Difficulty */}
                                        <div>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${diff.class}`}>
                                                {diff.label}
                                            </span>
                                        </div>

                                        {/* Acceptance */}
                                        <div className="text-sm text-slate-500 font-medium">
                                            {problem.acceptance || '—'}
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex justify-end">
                                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Footer note */}
                {!loading && filteredProblems.length > 0 && (
                    <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                        Showing {filteredProblems.length} of {problems.length} problems
                    </p>
                )}
            </div>
        </div>
    )
}
