import { useEffect, useState } from 'react'
import { listUsers, updateUserRole } from '../lib/api'

const ROLES = ['Student', 'TPO/Faculty', 'Admin']

export default function ManageUsers() {
    const [users, setUsers] = useState([])
    const [saving, setSaving] = useState('')
    const [error, setError] = useState('')

    async function refresh() {
        try {
            const r = await listUsers()
            setUsers(r.data)
        } catch (e) {
            setUsers([])
        }
    }

    useEffect(() => { refresh() }, [])

    async function changeRole(userId, role) {
        setError('')
        setSaving(userId)
        try {
            await updateUserRole(userId, role)
            await refresh()
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to update role')
        } finally {
            setSaving('')
        }
    }

    return (
        <div className="container-page py-8">
            <h2 className="text-2xl font-semibold">Manage Users</h2>
            {error && <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="mt-6 overflow-hidden rounded-xl border">
                <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Role</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map(u => (
                            <tr key={u._id}>
                                <td className="px-4 py-2">{u.name}</td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">
                                    <select
                                        className="rounded-md border bg-white px-2 py-1"
                                        value={u.role}
                                        onChange={e => changeRole(u._id, e.target.value)}
                                    >
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-2 text-right text-sm text-gray-500">
                                    {saving === u._id && 'Saving...'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


