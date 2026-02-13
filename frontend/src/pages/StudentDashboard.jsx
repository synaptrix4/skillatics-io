import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myResults, myTopicAverages, api } from '../lib/api' // Updated import
import { Line, Bar, Radar } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement, RadialLinearScale, Filler } from 'chart.js'
import { TrendingUp, Target, Award, Clock, Loader2, ArrowRight, Calendar, Sparkles, AlertTriangle, CheckCircle2, Code2 } from 'lucide-react'

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement, RadialLinearScale, Filler)

export default function StudentDashboard() {
    const [rows, setRows] = useState([])
    const [topics, setTopics] = useState([])
    const [skills, setSkills] = useState([])
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        Promise.all([
            myResults(),
            myTopicAverages(),
            api.get('/data/skill-gaps').catch(e => ({ data: [] })),
            api.get('/data/recommendations').catch(e => ({ data: [] }))
        ])
            .then(([r1, r2, r3, r4]) => {
                if (!mounted) return
                setRows(r1.data || [])
                setTopics(r2.data || [])
                setSkills(r3.data || [])
                setRecommendations(r4.data || [])
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
        datasets: [{ label: 'Score', data: rows.map(r => r.score), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.15)', tension: 0.4, fill: true }]
    }

    // Skill Radar Data
    const skillData = {
        labels: skills.map(s => s.topic),
        datasets: [
            {
                label: 'Proficiency',
                data: skills.map(s => s.accuracy),
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366f1',
                borderWidth: 2,
            }
        ]
    }

    const avgScore = rows.length > 0 ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0
    const totalTests = rows.length
    const lastScore = rows.length > 0 ? rows[rows.length - 1].score : 0
    const bestScore = rows.length > 0 ? Math.max(...rows.map(r => r.score)) : 0

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-xl">
                <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
                        <p className="mt-2 text-indigo-100">Ready to level up your skills today?</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/test"
                            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Start Adaptive Test
                            </span>
                        </Link>
                        <Link
                            to="/coding-practice"
                            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-lg"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Code2 className="h-5 w-5" />
                                Coding Practice
                            </span>
                        </Link>
                    </div>
                </div>
                {/* Decorative Circles */}
                <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-500/20 blur-2xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{avgScore}%</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3 shadow-inner">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Tests</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{totalTests}</p>
                        </div>
                        <div className="rounded-xl bg-green-50 p-3 shadow-inner">
                            <Target className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Best Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{bestScore}%</p>
                        </div>
                        <div className="rounded-xl bg-yellow-50 p-3 shadow-inner">
                            <Award className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Last Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{lastScore}%</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3 shadow-inner">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Skill Gap Analysis (Radar) */}
                <div className="glass-card rounded-2xl p-6 lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5 text-indigo-600" />
                        Skill Analysis
                    </h3>
                    <div className="h-[300px] flex items-center justify-center">
                        {skills.length > 0 ? (
                            <Radar
                                data={skillData}
                                options={{
                                    maintainAspectRatio: false,
                                    scales: {
                                        r: {
                                            beginAtZero: true,
                                            max: 100,
                                            ticks: { stepSize: 20 }
                                        }
                                    },
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        ) : (
                            <div className="text-center text-gray-400">
                                <p>Not enough data for analysis</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Trend */}
                <div className="glass-card rounded-2xl p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Trend</h3>
                    <div className="h-[300px]">
                        {rows.length > 0 ? (
                            <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-400">
                                <p>No data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Personalized Recommendations
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, idx) => (
                            <div key={idx} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-start gap-4">
                                    <div className={`rounded-full p-2 ${rec.type === 'strength' ? 'bg-green-100 text-green-600' :
                                        rec.type === 'weakness' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {rec.type === 'strength' ? <Award className="h-5 w-5" /> :
                                            rec.type === 'weakness' ? <AlertTriangle className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 capitalize">{rec.topic || "General Advice"}</h4>
                                        <p className="mt-1 text-sm text-gray-600">{rec.message}</p>
                                        {rec.action && (
                                            <Link to={rec.action} className="mt-3 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                                                Take Action <ArrowRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-8 text-gray-500">
                            Complete more tests to generate personalized insights!
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {rows.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-gray-500">No recent activity found.</p>
                            <Link to="/test" className="mt-2 font-medium text-indigo-600 hover:text-indigo-700">Get Started &rarr;</Link>
                        </div>
                    ) : (
                        rows.map(r => (
                            <div key={r._id} className="p-6 transition-colors hover:bg-gray-50/80">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl font-bold shadow-sm ${r.score >= 80 ? 'bg-green-100 text-green-700' :
                                            r.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {r.score}%
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {r.type || "General Test"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(r.completedAt).toLocaleDateString()} • {r.correctQuestions}/{r.totalQuestions} Correct
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty Path</p>
                                            <div className="mt-1 flex gap-1">
                                                {r.adaptivePath?.slice(-10).map((l, i) => (
                                                    <span key={i} className={`h-1.5 w-4 rounded-full ${l >= 4 ? 'bg-red-400' : l >= 3 ? 'bg-yellow-400' : 'bg-green-400'
                                                        }`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div >
    )
}


