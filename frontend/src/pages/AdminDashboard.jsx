import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listUsers, addQuestion } from '../lib/api'

export default function AdminDashboard() {
	const [users, setUsers] = useState([])
	const [q, setQ] = useState({ text: '', topic: '', difficulty: 2, type: 'Aptitude', options: '', answer: '' })
	const [msg, setMsg] = useState('')

	useEffect(() => {
		listUsers().then(r => setUsers(r.data)).catch(() => setUsers([]))
	}, [])

	async function addQ() {
		setMsg('')
		try {
			const payload = { ...q, options: q.options.split('|').map(s => s.trim()) }
			await addQuestion(payload)
			setMsg('Question added')
		} catch (e) {
			setMsg(e.response?.data?.error || 'Failed to add')
		}
	}

    return (
        <div className="container-page py-8">
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Users</h3>
                        <Link className="text-indigo-600 hover:underline" to="/admin/manage-users">Manage Users</Link>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm">
                        {users.map(u => <li key={u._id} className="rounded-md border p-2">{u.name} — {u.email} ({u.role})</li>)}
                    </ul>
                </div>
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-medium">Add Question</h3>
                    <div className="mt-3 space-y-3">
                        <div>
                            <label className="text-sm font-medium">Text</label>
                            <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={q.text} onChange={e => setQ({ ...q, text: e.target.value })} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Topic</label>
                                <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={q.topic} onChange={e => setQ({ ...q, topic: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Difficulty (1-5)</label>
                                <input type="number" min={1} max={5} className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={q.difficulty} onChange={e => setQ({ ...q, difficulty: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring" value={q.type} onChange={e => setQ({ ...q, type: e.target.value })}>
                                    <option>Aptitude</option>
                                    <option>Technical</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Answer (must match one option)</label>
                                <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={q.answer} onChange={e => setQ({ ...q, answer: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Options</label>
                            <p className="text-xs text-gray-500">Add 2–6 options. Separate with the pipe symbol: Option A | Option B | Option C</p>
                            <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={q.options} onChange={e => setQ({ ...q, options: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800" onClick={addQ}>Add Question</button>
                            {msg && <div className="text-sm text-gray-700">{msg}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


