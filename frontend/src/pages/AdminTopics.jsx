import { useEffect, useState } from 'react';
import { adminListTopics, adminCreateTopic, adminUpdateTopic, adminDeleteTopic } from '../lib/api';

export default function AdminTopics() {
  const [topics, setTopics] = useState([]);
  const [topicForm, setTopicForm] = useState({ name: '', category: 'General Aptitude', theory: '', shortcuts: '' });
  const [msg, setMsg] = useState('');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshTopics();
  }, []);

  async function refreshTopics() {
    setLoading(true);
    try {
      const r = await adminListTopics();
      setTopics(r.data || []);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    try {
      if (editId) {
        await adminUpdateTopic(editId, topicForm);
        setMsg('Topic updated');
      } else {
        await adminCreateTopic(topicForm);
        setMsg('Topic created');
      }
      setTopicForm({ name: '', category: 'General Aptitude', theory: '', shortcuts: '' });
      setEditId(null);
      await refreshTopics();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to save topic');
    }
  }

  function doEdit(t) {
    setEditId(t._id);
    setTopicForm({ name: t.name || '', category: t.category || 'General Aptitude', theory: t.theory || '', shortcuts: t.shortcuts || '' });
    setMsg('');
  }

  function doCancel() {
    setEditId(null);
    setTopicForm({ name: '', category: 'General Aptitude', theory: '', shortcuts: '' });
    setMsg('');
  }

  async function doDelete(id) {
    if (!window.confirm('Delete this topic?')) return;
    try {
      await adminDeleteTopic(id);
      setMsg('Topic deleted');
      await refreshTopics();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Failed to delete');
    }
  }

  return (
    <div className="container-page py-8">
      <h2 className="text-2xl font-semibold mb-6">Manage Topics</h2>
      <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5 shadow-sm mb-8 max-w-2xl">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select className="mt-1 w-full rounded-md border bg-white px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.category} onChange={e => setTopicForm({ ...topicForm, category: e.target.value })}>
              <option>General Aptitude</option>
              <option>Technical Aptitude</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Theory</label>
            <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.theory} onChange={e => setTopicForm({ ...topicForm, theory: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Shortcuts</label>
            <textarea rows={3} className="mt-1 w-full rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" value={topicForm.shortcuts} onChange={e => setTopicForm({ ...topicForm, shortcuts: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-5">
          <button className="rounded-md bg-indigo-600 px-6 py-2 text-white" type="submit">{editId ? 'Save Changes' : 'Add Topic'}</button>
          {editId && <button type="button" className="rounded-md bg-gray-200 px-4 py-2 text-gray-700" onClick={doCancel}>Cancel</button>}
          {msg && <div className="text-sm text-gray-700 ml-2">{msg}</div>}
        </div>
      </form>
      <div className="overflow-hidden rounded-xl border">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Category</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Theory</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Shortcuts</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {topics.map(t => (
              <tr key={t._id}>
                <td className="px-4 py-2 font-semibold">{t.name}</td>
                <td className="px-4 py-2">{t.category}</td>
                <td className="px-4 py-2 max-w-xs truncate" title={t.theory}>{t.theory && t.theory.length > 64 ? t.theory.slice(0,60)+'…' : t.theory}</td>
                <td className="px-4 py-2 max-w-xs truncate" title={t.shortcuts}>{t.shortcuts && t.shortcuts.length > 64 ? t.shortcuts.slice(0,60)+'…' : t.shortcuts}</td>
                <td className="px-4 py-2 text-right text-sm">
                  <button className="text-indigo-600 hover:underline mr-2" onClick={() => doEdit(t)}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => doDelete(t._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {topics.length === 0 && <tr><td className="px-4 py-4 text-sm text-gray-600" colSpan={5}>No topics yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}



