import { useEffect, useMemo, useState } from 'react'
import { batchAnalytics, studentStats } from '../lib/api'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { getCurrentUser } from '../lib/auth'
import { Users, TrendingUp, Target, Award, Loader2, Filter } from 'lucide-react'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function FacultyDashboard() {
    const [data, setData] = useState(null)
    const [students, setStudents] = useState([])
    const [scope, setScope] = useState('college') // college | department | division
    const [department, setDepartment] = useState('')
    const [division, setDivision] = useState('')
    const [yearOfStudy, setYearOfStudy] = useState('')
    const [loading, setLoading] = useState(true)
    const me = useMemo(() => getCurrentUser() || {}, [])

    const YEAR_OPTIONS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year']

    function refresh() {
        setLoading(true)
        const params = new URLSearchParams()
        if (scope) params.set('scope', scope)
        if (department) params.set('department', department)
        if (division) params.set('division', division)
        if (yearOfStudy) params.set('yearOfStudy', yearOfStudy)
        Promise.all([
            batchAnalytics(params.toString()).then(r => setData(r.data)).catch(() => setData({ avgScore: 0, tests: 0, avgCorrect: 0, avgTotal: 0 })),
            studentStats(params.toString()).then(r => setStudents(r.data || [])).catch(() => setStudents([]))
        ]).finally(() => setLoading(false))
    }

    useEffect(() => { refresh() }, [scope, department, division, yearOfStudy])

    if (loading && !data) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
        </div>
    )

    const chartData = {
        labels: ['Avg Score', 'Tests', 'Avg Correct', 'Avg Total'],
        datasets: [{
            label: 'Batch Analytics',
            data: [data.avgScore || 0, data.tests || 0, data.avgCorrect || 0, data.avgTotal || 0],
            backgroundColor: ['#4f46e5', '#22c55e', '#f59e0b', '#06b6d4']
        }]
    }

    return (
        <div className="space-y-8">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white">{me.role === 'TPO' ? 'TPO Executive Dashboard' : 'Faculty Dashboard'}</h1>
                    <p className="mt-2 text-indigo-100">Monitor and analyze performance metrics for {me.role === 'TPO' ? 'the entire college' : 'your department'}.</p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-12 -translate-y-12 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-white/10 blur-2xl" />
            </div>

            {/* Filters */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                    <div className="rounded-lg bg-gray-100 p-2">
                        <Filter className="h-5 w-5 text-gray-700" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {me.role === 'TPO' && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Scope</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    value={scope}
                                    onChange={e => setScope(e.target.value)}
                                >
                                    <option value="college">Full College</option>
                                    <option value="department">Department Wise</option>
                                    <option value="division">Division Wise</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {(me.role === 'TPO' && (scope === 'department' || scope === 'division')) && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Department</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    <option>Computer Engineering</option>
                                    <option>Information Technology</option>
                                    <option>Electronics and Telecommunication</option>
                                    <option>Electrical Engineering</option>
                                    <option>Mechanical Engineering</option>
                                    <option>Civil Engineering</option>
                                    <option>Artificial Intelligence and Data Science</option>
                                    <option>Artificial Intelligence and Machine Learning</option>
                                    <option>Data Science</option>
                                    <option>Electronics Engineering</option>
                                    <option>Instrumentation Engineering</option>
                                    <option>Chemical Engineering</option>
                                    <option>Biomedical Engineering</option>
                                    <option>Production Engineering</option>
                                    <option>Mechatronics</option>
                                    <option>Automobile Engineering</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {(me.role === 'TPO' && scope === 'division') && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Division</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                value={division}
                                onChange={e => setDivision(e.target.value)}
                                placeholder="e.g. A"
                            />
                        </div>
                    )}
                    {me.role === 'Faculty' && (
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Division (Optional)</label>
                            <input
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                value={division}
                                onChange={e => setDivision(e.target.value)}
                                placeholder="e.g. A, B, C"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Year of Study</label>
                        <div className="relative">
                            <select
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                value={yearOfStudy}
                                onChange={e => setYearOfStudy(e.target.value)}
                            >
                                <option value="">All Years</option>
                                {YEAR_OPTIONS.map(year => (
                                    <option key={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((data?.avgScore || 0) * 100) / 100}%</p>
                        </div>
                        <div className="rounded-xl bg-indigo-50 p-3">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">At-Risk Students</p>
                            <p className="mt-2 text-3xl font-bold text-red-600">
                                {students.filter(s => (s.avgScore || 0) < 40).length}
                            </p>
                            <p className="text-xs text-red-400 mt-1">Avg Score &lt; 40%</p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-3">
                            <Target className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Avg Correct</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((data?.avgCorrect || 0) * 100) / 100}</p>
                        </div>
                        <div className="rounded-xl bg-yellow-50 p-3">
                            <Award className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-6 hover-scale">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Students</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{students.length}</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-lg font-bold text-gray-900">Batch Metrics</h3>
                    <p className="text-sm text-gray-500">Overall performance indicators</p>
                    <div className="mt-8 h-[300px]">
                        <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="glass-card rounded-2xl p-8">
                    <h3 className="text-lg font-bold text-gray-900">Score Distribution</h3>
                    <p className="text-sm text-gray-500">Student performance spread</p>
                    <div className="mt-8 h-[300px]">
                        <Bar
                            data={{
                                labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
                                datasets: [{
                                    label: 'Students',
                                    data: [
                                        students.filter(s => s.avgScore <= 20).length,
                                        students.filter(s => s.avgScore > 20 && s.avgScore <= 40).length,
                                        students.filter(s => s.avgScore > 40 && s.avgScore <= 60).length,
                                        students.filter(s => s.avgScore > 60 && s.avgScore <= 80).length,
                                        students.filter(s => s.avgScore > 80).length
                                    ],
                                    backgroundColor: ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e']
                                }]
                            }}
                            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                        />
                    </div>
                </div>
            </div>

            {/* Student Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900">Student Performance</h3>
                    <p className="text-sm text-gray-500">Detailed list of student statistics</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Year</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tests Taken</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Avg Score</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">No student data found matching filters</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map(s => (
                                    <tr key={s.studentId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-white shadow-sm">
                                                    {s.name?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-semibold text-gray-900">{s.name || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{s.email || '—'}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                {s.yearOfStudy || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                                                {s.tests || 0} tests
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="font-bold text-gray-900">{Math.round((s.avgScore || 0) * 100) / 100}%</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {s.lastCompleted ? new Date(s.lastCompleted).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


