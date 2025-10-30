import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listUsers, addQuestion, uploadQuestionsCsv, adminListTopics, adminCreateTopic, adminUpdateTopic, adminDeleteTopic } from '../lib/api'
import "react-quill/dist/quill.snow.css"; // Add this import at the top level once
import ReactQuill from "react-quill";

export default function AdminDashboard() {
	const [users, setUsers] = useState([])
	const [q, setQ] = useState({ text: '', topic: '', difficulty: 2, type: 'Aptitude', options: '', answer: '' })
	const [msg, setMsg] = useState('')
    const [csvMsg, setCsvMsg] = useState('')
    const [csvFile, setCsvFile] = useState(null)
    const [topics, setTopics] = useState([])
    const [topicForm, setTopicForm] = useState({ name: '', category: 'General Aptitude', theory: '', shortcuts: '' })
    const [topicMsg, setTopicMsg] = useState('')

	useEffect(() => {
		listUsers().then(r => setUsers(r.data)).catch(() => setUsers([]))
        refreshTopics()
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

    async function uploadCsv() {
        setCsvMsg('')
        if (!csvFile) { setCsvMsg('Please choose a CSV file'); return }
        try {
            const fd = new FormData()
            fd.append('file', csvFile)
            const r = await uploadQuestionsCsv(fd)
            const ins = r.data?.inserted || 0
            const errs = (r.data?.errors || []).length
            setCsvMsg(`Uploaded: ${ins} inserted${errs ? `, ${errs} errors` : ''}`)
        } catch (e) {
            setCsvMsg(e.response?.data?.error || 'Upload failed')
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
                                    <option>General Aptitude</option>
                                    <option>Technical Aptitude</option>
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
                <div className="rounded-xl border bg-white p-4 shadow-sm">
                    <h3 className="text-lg font-medium">Bulk Upload Questions (CSV)</h3>
                    <div className="mt-3 space-y-3">
                        <p className="text-sm text-gray-600">CSV columns: <b>text, topic, difficulty, type, options, answer</b>. Type must be "General Aptitude" or "Technical Aptitude". Options pipe-separated, e.g. A | B | C</p>
                        <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
                        <div className="flex items-center gap-3">
                            <button className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500" onClick={uploadCsv}>Upload CSV</button>
                            {csvMsg && <div className="text-sm text-gray-700">{csvMsg}</div>}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border bg-white p-4 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Manage Topics</h3>
                        <button className="text-sm text-indigo-600 hover:underline" onClick={refreshTopics}>Refresh</button>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div>
                            <div className="grid gap-3">
                                <div>
                                    <label className="text-sm font-medium">Name</label>
                                    <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Category</label>
                                    <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.category} onChange={e => setTopicForm({ ...topicForm, category: e.target.value })}>
                                        <option>General Aptitude</option>
                                        <option>Technical Aptitude</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Theory</label>
                                    <textarea rows={6} className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.theory} onChange={e => setTopicForm({ ...topicForm, theory: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Shortcuts</label>
                                    <textarea rows={6} className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.shortcuts} onChange={e => setTopicForm({ ...topicForm, shortcuts: e.target.value })} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800" onClick={topicForm._id ? saveTopicEdit : createTopic}>{topicForm._id ? 'Save Changes' : 'Create Topic'}</button>
                                    {topicMsg && <div className="text-sm text-gray-700">{topicMsg}</div>}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="overflow-hidden rounded-xl border">
                                <table className="min-w-full divide-y">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-sm font-medium">Name</th>
                                            <th className="px-3 py-2 text-left text-sm font-medium">Category</th>
                                            <th className="px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {topics.map(t => (
                                            <tr key={t._id}>
                                                <td className="px-3 py-2">{t.name}</td>
                                                <td className="px-3 py-2">{t.category}</td>
                                                <td className="px-3 py-2 text-right text-sm">
                                                    <button className="text-indigo-600 hover:underline" onClick={() => editTopic(t)}>Edit</button>
                                                    <button className="ml-3 text-red-600 hover:underline" onClick={() => removeTopic(t._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {topics.length === 0 && <tr><td className="px-3 py-4 text-sm text-gray-600" colSpan={3}>No topics yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

async function refreshTopics() {
    try {
        const r = await adminListTopics()
        setTopics(r.data || [])
    } catch {
        setTopics([])
    }
}

async function createTopic() {
    setTopicMsg('')
    try {
        await adminCreateTopic(topicForm)
        setTopicMsg('Topic created')
        setTopicForm({ name: '', category: 'General Aptitude', theory: '', shortcuts: '' })
        await refreshTopics()
    } catch (e) {
        setTopicMsg(e.response?.data?.error || 'Failed to create')
    }
}

function editTopic(t) {
    setTopicForm({ _id: t._id, name: t.name || '', category: t.category || 'General Aptitude', theory: t.theory || '', shortcuts: t.shortcuts || '' })
}

async function removeTopic(id) {
    try {
        await adminDeleteTopic(id)
        await refreshTopics()
    } catch (e) {}
}

async function saveTopicEdit() {
    if (!topicForm._id) return
    setTopicMsg('')
    try {
        const {_id, ...payload} = topicForm
        await adminUpdateTopic(_id, payload)
        setTopicMsg('Topic updated')
        setTopicForm({ name: '', category: 'General Aptitude', theory: '', shortcuts: '' })
        await refreshTopics()
    } catch (e) {
        setTopicMsg(e.response?.data?.error || 'Failed to update')
    }
}


