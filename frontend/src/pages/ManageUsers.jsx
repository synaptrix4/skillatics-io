import { useEffect, useState } from 'react'
import { listUsers, updateUserRole, updateUserDepartment } from '../lib/api'
import { Search, Filter, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const ROLES = ['Student', 'Faculty', 'TPO', 'Admin']

export default function ManageUsers() {
    const [users, setUsers] = useState([])
    const [saving, setSaving] = useState('')
    const [error, setError] = useState('')
    const [successMsg, setSuccessMsg] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('All')
    const [loading, setLoading] = useState(true)

    async function refresh() {
        setLoading(true)
        try {
            const r = await listUsers()
            setUsers(r.data)
        } catch (e) {
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { refresh() }, [])

    async function changeRole(userId, role) {
        setError('')
        setSuccessMsg('')
        setSaving(userId)
        try {
            await updateUserRole(userId, role)
            await refresh()
            setSuccessMsg('Role updated successfully. User must refresh their session for changes to take effect.')
            setTimeout(() => setSuccessMsg(''), 5000)
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to update role')
        } finally {
            setSaving('')
        }
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'All' || u.role === roleFilter
        return matchesSearch && matchesRole
    })

    const roleColors = {
        'Admin': 'bg-red-100 text-red-700 border-red-200',
        'Faculty': 'bg-purple-100 text-purple-700 border-purple-200',
        'TPO': 'bg-orange-100 text-orange-700 border-orange-200',
        'Student': 'bg-blue-100 text-blue-700 border-blue-200',
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                <p className="mt-2 text-gray-600">View and manage user roles and permissions</p>
            </div>

            {/* Alerts */}
            {error && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {successMsg && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option>All</option>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'Student').length}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm text-gray-600">Faculty</p>
                    <p className="mt-1 text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'Faculty').length}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-sm text-gray-600">Admins</p>
                    <p className="mt-1 text-2xl font-bold text-red-600">{users.filter(u => u.role === 'Admin').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                                        <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
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
                                            <select
                                                className={`rounded-lg border px-3 py-1.5 text-sm font-medium outline-none ring-indigo-500 focus:ring-2 ${roleColors[u.role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                value={u.role}
                                                onChange={e => changeRole(u._id, e.target.value)}
                                                disabled={saving === u._id}
                                            >
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {u.role === 'Faculty' ? (
                                                <select
                                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none ring-indigo-500 focus:ring-2"
                                                    value={u.department || ''}
                                                    onChange={async (e) => { setSaving(u._id); try { await updateUserDepartment(u._id, e.target.value); await refresh(); } catch (err) { setError(err.response?.data?.error || 'Failed to update department') } finally { setSaving('') } }}
                                                    disabled={saving === u._id}
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
                                            ) : (
                                                <span className="text-sm text-gray-600">{u.department || '—'}</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {saving === u._id && (
                                                <div className="flex items-center gap-2 text-indigo-600">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Saving...</span>
                                                </div>
                                            )}
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


