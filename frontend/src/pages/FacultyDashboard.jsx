import { useEffect, useState } from 'react'
import { batchAnalytics, studentStats } from '../lib/api'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function FacultyDashboard() {
	const [data, setData] = useState(null)
    const [students, setStudents] = useState([])

    useEffect(() => {
        batchAnalytics().then(r => setData(r.data)).catch(() => setData({ avgScore: 0, tests: 0, avgCorrect: 0, avgTotal: 0 }))
        studentStats().then(r => setStudents(r.data || [])).catch(() => setStudents([]))
    }, [])

    if (!data) return <div className="container-page py-8">Loading...</div>

	const chartData = {
		labels: ['Avg Score', 'Tests', 'Avg Correct', 'Avg Total'],
		datasets: [{
			label: 'Batch Analytics',
			data: [data.avgScore || 0, data.tests || 0, data.avgCorrect || 0, data.avgTotal || 0],
			backgroundColor: ['#4f46e5', '#22c55e', '#f59e0b', '#06b6d4']
		}]
	}

    return (
        <div className="container-page py-8">
            <h2 className="text-2xl font-semibold">TPO/Faculty Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">Overview of cohort performance.</p>
            <div className="mt-6 rounded-xl border bg-white p-4 shadow-sm lg:max-w-3xl">
                <h3 className="text-lg font-medium">Batch Analytics</h3>
                <div className="mt-3">
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700 sm:grid-cols-4">
                    <div><b>Avg Score:</b> {Math.round((data.avgScore || 0) * 100) / 100}</div>
                    <div><b>Total Tests:</b> {data.tests || 0}</div>
                    <div><b>Avg Correct:</b> {Math.round((data.avgCorrect || 0) * 100) / 100}</div>
                    <div><b>Avg Questions:</b> {Math.round((data.avgTotal || 0) * 100) / 100}</div>
                </div>
            </div>
            <div className="mt-8 rounded-xl border bg-white p-4 shadow-sm">
                <h3 className="text-lg font-medium">Student-wise Statistics</h3>
                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full divide-y">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium">Student</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Tests</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Avg Score</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Last Completed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {students.map(s => (
                                <tr key={s.studentId}>
                                    <td className="px-4 py-2">{s.name || '—'}</td>
                                    <td className="px-4 py-2">{s.email || '—'}</td>
                                    <td className="px-4 py-2">{s.tests || 0}</td>
                                    <td className="px-4 py-2">{Math.round((s.avgScore || 0) * 100) / 100}</td>
                                    <td className="px-4 py-2">{s.lastCompleted ? new Date(s.lastCompleted).toLocaleString() : '—'}</td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr><td className="px-4 py-3 text-sm text-gray-600" colSpan={5}>No data yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


