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
        <div className="py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your platform and monitor activity</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
                            </div>
                            <div className={`rounded-full bg-${stat.color}-100 p-3`}>
                                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid gap-6 lg:grid-cols-3">
                    {quickActions.map((action, idx) => (
                        <Link 
                            key={idx}
                            to={action.to} 
                            className="group relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`rounded-lg bg-${action.color}-100 p-3`}>
                                    <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                                </div>
                                {action.count !== null && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                                        {action.count}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                            <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                            <div className="flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
                                Get started
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Users */}
            <div className="rounded-xl border bg-white shadow-sm">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                        <p className="mt-1 text-sm text-gray-600">Latest registered users on the platform</p>
                    </div>
                    <Link 
                        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700" 
                        to="/admin/manage-users"
                    >
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {users.slice(0, 8).map(u => (
                                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.name || 'Unnamed'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{u.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleColors[u.role] || 'bg-gray-100 text-gray-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{u.department || '—'}</td>
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


