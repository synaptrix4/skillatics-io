import { useEffect, useState } from 'react';
import { adminListTopics, adminCreateTopic, adminUpdateTopic, adminDeleteTopic } from '../lib/api';
import { Plus, Edit2, Trash2, Save, X, Loader2, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

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
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const categoryColors = {
    'General Aptitude': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Technical Aptitude': 'bg-violet-100 text-violet-700 border-violet-200',
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Topics</h1>
        <p className="mt-2 text-gray-600">Create and manage learning topics for students</p>
      </div>

      {/* Alert Messages */}
      {msg && msg.includes('deleted') && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}
      {msg && (msg.includes('created') || msg.includes('updated')) && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {editId ? 'Edit Topic' : 'Add New Topic'}
          </h2>
          {editId && (
            <button type="button" onClick={doCancel} className="text-sm text-gray-600 hover:text-gray-900">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic Name</label>
            <input 
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2" 
              value={topicForm.name} 
              onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} 
              placeholder="e.g., Data Structures"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none ring-indigo-500 focus:border-indigo-500 focus:ring-2" 
              value={topicForm.category} 
              onChange={e => setTopicForm({ ...topicForm, category: e.target.value })}
            >
              <option>General Aptitude</option>
              <option>Technical Aptitude</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Theory Content</label>
            <div className="rounded-lg border border-gray-300">
              <ReactQuill 
                theme="snow" 
                value={topicForm.theory} 
                onChange={(val) => setTopicForm({ ...topicForm, theory: val })} 
                placeholder="Add theoretical content here..."
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Shortcuts & Tips</label>
            <div className="rounded-lg border border-gray-300">
              <ReactQuill 
                theme="snow" 
                value={topicForm.shortcuts} 
                onChange={(val) => setTopicForm({ ...topicForm, shortcuts: val })} 
                placeholder="Add shortcuts and tips here..."
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          <button 
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700" 
            type="submit"
          >
            {editId ? <><Save className="h-4 w-4" /> Save Changes</> : <><Plus className="h-4 w-4" /> Add Topic</>}
          </button>
          {editId && (
            <button 
              type="button" 
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50" 
              onClick={doCancel}
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Topics List */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Topics</h2>
              <p className="mt-1 text-sm text-gray-600">{topics.length} topics available</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Theory</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Shortcuts</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                    <p className="mt-2 text-sm text-gray-500">Loading topics...</p>
                  </td>
                </tr>
              ) : topics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No topics yet. Create your first topic above.</p>
                  </td>
                </tr>
              ) : (
                topics.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                          <BookOpen className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${categoryColors[t.category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-600" title={t.theory?.replace(/<[^>]+>/g,'')}>
                        {(t.theory || '').replace(/<[^>]+>/g,'').slice(0,60)}{((t.theory || '').replace(/<[^>]+>/g,'').length>60)?'…':'—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-sm text-gray-600" title={t.shortcuts?.replace(/<[^>]+>/g,'')}>
                        {(t.shortcuts || '').replace(/<[^>]+>/g,'').slice(0,60)}{((t.shortcuts || '').replace(/<[^>]+>/g,'').length>60)?'…':'—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button 
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 mr-4" 
                        onClick={() => doEdit(t)}
                      >
                        <Edit2 className="h-4 w-4" /> Edit
                      </button>
                      <button 
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-900" 
                        onClick={() => doDelete(t._id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}





