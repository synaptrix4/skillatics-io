import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { myResults, myTopicAverages } from '../lib/api'
import { Line, Bar } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, BarElement } from 'chart.js'

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

	if (loading) return <div style={{ padding: 16 }}>Loading...</div>

    const lineData = {
        labels: rows.map(r => new Date(r.completedAt).toLocaleDateString()),
        datasets: [{ label: 'Score', data: rows.map(r => r.score), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.15)' }]
    }
    const barData = {
        labels: topics.map(t => t.topic || 'Unknown'),
        datasets: [{ label: 'Avg Score', data: topics.map(t => Math.round((t.avgScore || 0) * 100) / 100), backgroundColor: '#22c55e' }]
    }

    return (
        <div className="container-page py-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Student Dashboard</h2>
                <Link className="rounded-md bg-indigo-600 px-4 py-2 text-white" to="/test">Start Adaptive Test</Link>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-medium">Score Over Time</h3>
                    <div className="mt-3">
                        <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-medium">Average Score by Topic</h3>
                    <div className="mt-3">
                        <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium">Test History</h3>
                {rows.length === 0 && <div className="mt-2 text-sm text-gray-600">No results yet.</div>}
                <div className="mt-3 grid gap-3">
                    {rows.map(r => (
                        <div key={r._id} className="rounded-lg border bg-white p-3">
                            <div className="text-sm"><b>Score:</b> {r.score} ({r.correctQuestions}/{r.totalQuestions})</div>
                            <div className="text-sm"><b>Completed:</b> {new Date(r.completedAt).toLocaleString()}</div>
                            <div className="text-sm"><b>Adaptive Path:</b> {r.adaptivePath?.join(' → ')}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


