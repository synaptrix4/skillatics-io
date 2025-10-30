import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTopics } from '../lib/api'

export default function StudentLearnDashboard() {
    const [data, setData] = useState({ generalAptitude: [], technicalAptitude: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        fetchTopics()
            .then(r => { if (mounted) setData(r.data || { generalAptitude: [], technicalAptitude: [] }) })
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    if (loading) return <div className="container-page py-8">Loading...</div>

    return (
        <div className="container-page py-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Learn</h2>
                <div className="flex items-center gap-3 text-sm">
                    <Link className="rounded-md bg-indigo-600 px-4 py-2 text-white" to="/test">Start Adaptive Test</Link>
                    <Link className="rounded-md border px-4 py-2" to="/analytics">View My Analytics</Link>
                </div>
            </div>

            <Section title="General Aptitude" items={data.generalAptitude} />
            <Section title="Technical Aptitude" items={data.technicalAptitude} />
        </div>
    )
}

function Section({ title, items }) {
    if (!items || items.length === 0) return null
    return (
        <div className="mt-8">
            <h3 className="text-lg font-medium">{title}</h3>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {items.map(t => (
                    <Link key={t._id} to={`/learn/topic/${t._id}`} className="group rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-indigo-600 text-white">{t.name?.[0] || '?'}</div>
                        <div className="mt-2 font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.category}</div>
                    </Link>
                ))}
            </div>
        </div>
    )
}


