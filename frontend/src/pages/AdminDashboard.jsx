import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listUsers, adminListTopics } from '../lib/api'
import { Users, BookOpen, FileQuestion, TrendingUp, ArrowRight, UserCheck, Shield } from 'lucide-react'

export default function AdminDashboard() {
    const [users, setUsers] = useState([])
    const [topics, setTopics] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            listUsers().then(r => setUsers(r.data)).catch(() => setUsers([])),
            adminListTopics().then(r => setTopics(r.data || [])).catch(() => setTopics([]))
        ]).finally(() => setLoading(false))
    }, [])

    const stats = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'indigo' },
        { label: 'Topics', value: topics.length, icon: BookOpen, color: 'violet' },
        { label: 'Students', value: users.filter(u => u.role === 'Student').length, icon: UserCheck, color: 'blue' },
        { label: 'Admins', value: users.filter(u => u.role === 'Admin').length, icon: Shield, color: 'emerald' },
    ]

    const quickActions = [
        {
            to: '/admin/manage-users',
            icon: Users,
            title: 'Manage Users',
            description: 'View and manage user roles and permissions',
            color: 'indigo',
            count: users.length
        },
        {
            to: '/admin/topics',
            icon: BookOpen,
            title: 'Manage Topics',
            description: 'Create and edit learning topics',
            color: 'violet',
            count: topics.length
        },
        {
            to: '/admin/questions',
            icon: FileQuestion,
            title: 'Manage Questions',
            description: 'Add questions individually or via CSV upload',
            color: 'blue',
            count: null
        },
    ]

    const roleColors = {
        'Admin': 'bg-red-100 text-red-700',
        'Faculty': 'bg-purple-100 text-purple-700',
        'TPO': 'bg-orange-100 text-orange-700',
        'Student': 'bg-blue-100 text-blue-700',
    }

    return (
        <div className="space-y-8">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 shadow-xl">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-300">System overview, user management, and platform configuration.</p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute right-0 top-0 h-64 w-64 translate-x-12 -translate-y-12 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-purple-500/20 blur-2xl" />
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card rounded-2xl p-6 hover-scale group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
                            </div>
                            <div className={`rounded-xl p-3 transition-colors ${stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100' :
                                    stat.color === 'violet' ? 'bg-violet-50 text-violet-600 group-hover:bg-violet-100' :
                                        stat.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' :
                                            'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
                                }`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Quick Actions
                </h2>
                <div className="grid gap-6 lg:grid-cols-3">
                    {quickActions.map((action, idx) => (
                        <Link
                            key={idx}
                            to={action.to}
                            className="glass-card group relative overflow-hidden rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`rounded-xl p-3 ${action.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                                        action.color === 'violet' ? 'bg-violet-50 text-violet-600' :
                                            'bg-blue-50 text-blue-600'
                                    }`}>
                                    <action.icon className="h-6 w-6" />
                                </div>
                                {action.count !== null && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                                        {action.count}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{action.title}</h3>
                            <p className="text-sm text-gray-500 mb-6">{action.description}</p>
                            <div className="flex items-center text-sm font-semibold text-indigo-600">
                                Manage
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Users */}
            <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Recent Registrations</h2>
                        <p className="text-sm text-gray-500">Latest users joining the platform</p>
                    </div>
                    <Link
                        className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                        to="/admin/manage-users"
                    >
                        View All Users
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {users.slice(0, 8).map(u => (
                                <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 font-bold">
                                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-semibold text-gray-900">{u.name || 'Unnamed'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{u.department || '—'}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No users registered yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}


