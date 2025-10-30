import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTopics } from '../lib/api'

export default function StudentTechnicalLearnDashboard() {
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        fetchTopics()
            .then(r => { if (mounted) setTopics(r.data?.technicalAptitude || []) })
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    if (loading) return <div>Loading...</div>
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Technical Aptitude Topics</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {topics.map(t => (
                    <Link
                        key={t._id}
                        to={`/learn/topic/${t._id}`}
                        className="group rounded-xl border bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-violet-700 text-white">{t.name?.[0] || '?'}</div>
                        <div className="mt-2 font-medium">{t.name}</div>
                    </Link>
                ))}
                {topics.length === 0 && <div className="col-span-full text-gray-500 mt-8">No topics found.</div>}
            </div>
        </div>
    )
}
