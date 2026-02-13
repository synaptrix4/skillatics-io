import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, CheckCircle2, Circle, ArrowRight, Signal, Lock, Search } from 'lucide-react'
import { api } from '../lib/api'

export default function CodingProblemsPage() {
    const navigate = useNavigate()
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [difficultyFilter, setDifficultyFilter] = useState('all') // all, easy, medium, hard
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
            const diffMap = { 'easy': 1, 'medium': 2, 'hard': 4 } // Approx mapping
            if (difficultyFilter === 'easy' && p.difficulty > 1) return false
            if (difficultyFilter === 'medium' && (p.difficulty <= 1 || p.difficulty > 3)) return false
            if (difficultyFilter === 'hard' && p.difficulty <= 3) return false
        }
        if (searchTerm && !p.text.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false
        }
        return true
    })

    const getDifficultyColor = (diff) => {
        if (diff === 1) return 'text-green-600 bg-green-50'
        if (diff <= 3) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    const getDifficultyLabel = (diff) => {
        if (diff === 1) return 'Easy'
        if (diff <= 3) return 'Medium'
        return 'Hard'
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Code2 className="h-8 w-8 text-indigo-600" />
                            Coding Problems
                        </h1>
                        <p className="text-gray-600 mt-1">Practice algorithmic skills with our curated problem set.</p>
                    </div>

                    {/* Stats or Action */}
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-center">
                            <div className="text-2xl font-bold text-indigo-600">{problems.length}</div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Total</div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {problems.filter(p => p.status === 'Solved').length}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-semibold">Solved</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {['all', 'easy', 'medium', 'hard'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setDifficultyFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${difficultyFilter === filter
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Problems List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                        Difficulty
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">
                                        Acceptance
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Action</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : filteredProblems.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No problems found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProblems.map((problem) => (
                                        <tr
                                            key={problem._id}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/coding-practice/${problem._id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {problem.status === 'Solved' ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-gray-300 group-hover:text-gray-400" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {problem.text}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                                                    {getDifficultyLabel(problem.difficulty)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {problem.acceptance}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                                    <ArrowRight className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
