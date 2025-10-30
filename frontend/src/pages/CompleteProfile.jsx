import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../lib/api'
import { getCurrentUser, saveAuth } from '../lib/auth'

export default function CompleteProfile() {
  const user = getCurrentUser() || {}
  const [form, setForm] = useState({
    name: user.name || '',
    mobile: '',
    gender: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const resp = await updateProfile(form)
      saveAuth(window.localStorage.getItem('skillatics_token'), resp.data.user)
      const role = resp.data.user?.role || 'Student'
      const redirect = role === 'Admin' ? '/admin' : role === 'TPO/Faculty' ? '/faculty' : '/student'
      window.location.href = redirect
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-2xl font-semibold mb-2 text-center">Complete Your Profile</h2>
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full mt-1 rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" />
        </div>
        <div>
          <label className="text-sm font-medium">Mobile Number</label>
          <input name="mobile" value={form.mobile} onChange={handleChange} required className="w-full mt-1 rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring" type="tel" pattern="[0-9]{10,}"
            placeholder="Enter your 10-digit number"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} required className="w-full mt-1 rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring">
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Department</label>
          <input name="department" value={form.department} onChange={handleChange} required className="w-full mt-1 rounded-md border px-3 py-2 outline-none ring-indigo-500 focus:ring"
            placeholder="e.g. Computer Science" />
        </div>
        {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60">
          {loading ? 'Saving...' : 'Save and Continue'}
        </button>
      </form>
    </div>
  )
}
