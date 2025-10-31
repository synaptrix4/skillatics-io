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
    const [loading, setLoading] = useState(true)
    const me = useMemo(() => getCurrentUser() || {}, [])

    function refresh() {
        setLoading(true)
        const params = new URLSearchParams()
        if (scope) params.set('scope', scope)
        if (department) params.set('department', department)
        if (division) params.set('division', division)
        Promise.all([
            batchAnalytics(params.toString()).then(r => setData(r.data)).catch(() => setData({ avgScore: 0, tests: 0, avgCorrect: 0, avgTotal: 0 })),
            studentStats(params.toString()).then(r => setStudents(r.data || [])).catch(() => setStudents([]))
        ]).finally(() => setLoading(false))
    }

    useEffect(() => { refresh() }, [scope, department, division])

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
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">{me.role === 'TPO' ? 'TPO Dashboard' : 'Faculty Dashboard'}</h1>
                <p className="mt-2 text-gray-600">Monitor and analyze {me.role === 'TPO' ? 'college-wide' : 'department'} student performance</p>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                    {me.role === 'TPO' && (
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                            <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2" value={scope} onChange={e => setScope(e.target.value)}>
                                <option value="college">Full College</option>
                                <option value="department">Department Wise</option>
                                <option value="division">Division Wise</option>
                            </select>
                        </div>
                    )}
                    {(me.role === 'TPO' && (scope === 'department' || scope === 'division')) && (
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                            <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2" value={department} onChange={e => setDepartment(e.target.value)}>
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
                    )}
                    {(me.role === 'TPO' && scope === 'division') && (
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                            <input className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2" value={division} onChange={e => setDivision(e.target.value)} placeholder="e.g. A" />
                        </div>
                    )}
                    {me.role === 'Faculty' && (
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Division (Optional)</label>
                            <input className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2" value={division} onChange={e => setDivision(e.target.value)} placeholder="e.g. A, B, C" />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Score</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((data?.avgScore || 0) * 100) / 100}%</p>
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
                            <p className="mt-2 text-3xl font-bold text-gray-900">{data?.tests || 0}</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3">
                            <Target className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Correct</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{Math.round((data?.avgCorrect || 0) * 100) / 100}</p>
                        </div>
                        <div className="rounded-full bg-yellow-100 p-3">
                            <Award className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Students</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{students.length}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
                <p className="text-sm text-gray-600">Batch analytics visualization</p>
                <div className="mt-6">
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
            </div>

            {/* Student Table */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Performance</h3>
                    <p className="mt-1 text-sm text-gray-600">Individual student statistics</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tests</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Avg Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Last Completed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">No student data available</p>
                                    </td>
                                </tr>
                            ) : (
                                students.map(s => (
                                    <tr key={s.studentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                                                    {s.name?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{s.name || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{s.email || '—'}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                                {s.tests || 0} tests
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900">{Math.round((s.avgScore || 0) * 100) / 100}%</div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                            {s.lastCompleted ? new Date(s.lastCompleted).toLocaleString() : '—'}
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


