import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTopics } from '../lib/api'
import { BookOpen, ArrowRight, Loader2 } from 'lucide-react'

export default function StudentGeneralLearnDashboard() {
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        fetchTopics()
            .then(r => { if (mounted) setTopics(r.data?.generalAptitude || []) })
            .finally(() => { if (mounted) setLoading(false) })
        return () => { mounted = false }
    }, [])

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                <p className="mt-4 text-gray-600">Loading topics...</p>
            </div>
        </div>
    )

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">General Aptitude</h1>
                <p className="mt-2 text-gray-600">Master quantitative, verbal, and logical reasoning skills</p>
            </div>

            {/* Topics Grid */}
            {topics.length === 0 ? (
                <div className="rounded-xl border bg-white p-12 text-center shadow-sm">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">No Topics Available</h3>
                    <p className="mt-2 text-sm text-gray-600">General aptitude topics will appear here once added by admin.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {topics.map(t => (
                        <Link
                            key={t._id}
                            to={`/learn/topic/${t._id}`}
                            className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold text-lg">
                                    {t.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                            </div>
                            <h3 className="mt-4 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {t.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">Click to learn more</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
