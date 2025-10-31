import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myResults, myTopicAverages } from '../lib/api'
import { Line, Bar } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement } from 'chart.js'
import { TrendingUp, Target, Award, Clock, Loader2, ArrowRight, Calendar } from 'lucide-react'

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement)

export default function StudentDashboard() {
    const [rows, setRows] = useState([])
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        Promise.all([myResults(), myTopicAverages()])
            .then(([r1, r2]) => {
                if (!mounted) return
                setRows(r1.data || [])
                setTopics(r2.data || [])
            })
            .finally(() => setLoading(false))
        return () => { mounted = false }
    }, [])

	if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-gray-600">Loading your analytics...</p>
            </div>
        </div>
    )

    const lineData = {
        labels: rows.map(r => r.completedAt ? new Date(r.completedAt).toLocaleDateString() : 'N/A'),
        datasets: [{ label: 'Score', data: rows.map(r => r.score), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.15)' }]
    }
    const barData = {
        labels: topics.map(t => t.topic || 'Unknown'),
        datasets: [{ label: 'Avg Score', data: topics.map(t => Math.round((t.avgScore || 0) * 100) / 100), backgroundColor: '#22c55e' }]
    }

    const avgScore = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0
    const totalTests = rows.length
    const lastScore = rows.length > 0 ? rows[rows.length - 1].score : 0
    const bestScore = rows.length > 0 ? Math.max(...rows.map(r => r.score)) : 0

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="mt-2 text-gray-600">Track your learning progress and performance</p>
                    </div>
                    <Link 
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700" 
                        to="/test"
                    >
                        <Target className="h-4 w-4" />
                        Start Adaptive Test
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{avgScore}%</p>
                        </div>
                        <div className="rounded-full bg-indigo-100 p-3">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tests</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{totalTests}</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3">
                            <Target className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Best Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{bestScore}%</p>
                        </div>
                        <div className="rounded-full bg-yellow-100 p-3">
                            <Award className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Last Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{lastScore}%</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Score Over Time</h3>
                    <p className="text-sm text-gray-600">Your performance trend</p>
                    <div className="mt-6">
                        {rows.length > 0 ? (
                            <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        ) : (
                            <div className="flex h-64 items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm">No test data yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900">Average Score by Topic</h3>
                    <p className="text-sm text-gray-600">Your strengths and weaknesses</p>
                    <div className="mt-6">
                        {topics.length > 0 ? (
                            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        ) : (
                            <div className="flex h-64 items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm">No topic data yet</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Test History */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Test History</h3>
                    <p className="mt-1 text-sm text-gray-600">Your recent test attempts</p>
                </div>
                <div className="divide-y">
                    {rows.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No test history yet. Take your first test!</p>
                            <Link 
                                to="/test" 
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Start Test <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    ) : (
                        rows.map(r => (
                            <div key={r._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                                                r.score >= 80 ? 'bg-green-100' : r.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                                            }`}>
                                                <span className={`text-lg font-bold ${
                                                    r.score >= 80 ? 'text-green-700' : r.score >= 60 ? 'text-yellow-700' : 'text-red-700'
                                                }`}>{r.score}%</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {r.correctQuestions}/{r.totalQuestions} Correct
                                                    </span>
                                                    {r.type && (
                                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                                            {r.type}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Completed {r.completedAt ? new Date(r.completedAt).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Difficulty Path</p>
                                        <p className="mt-1 text-sm font-medium text-gray-700">{r.adaptivePath?.join(' → ')}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}


