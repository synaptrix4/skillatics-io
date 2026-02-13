import { useState } from 'react'
import { getCurrentUser, saveAuth } from '../lib/auth'
import { updateProfile } from '../lib/api'
import { User, Phone, Users, Building2, Hash, GraduationCap, AlertCircle, CheckCircle2, Loader2, Edit2, Save, X } from 'lucide-react'

export default function StudentProfile() {
  const [user, setUser] = useState(getCurrentUser() || {})
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: user.name || '',
    mobile: user.mobile || '',
    gender: user.gender || '',
    department: user.department || '',
    division: user.division || '',
    rollNo: user.rollNo || '',
    yearOfStudy: user.yearOfStudy || '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const resp = await updateProfile(form)
      saveAuth(window.localStorage.getItem('skillatics_token'), resp.data.user)
      // Update the local user state to reflect changes immediately
      setUser(resp.data.user)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setForm({
      name: user.name || '',
      mobile: user.mobile || '',
      gender: user.gender || '',
      department: user.department || '',
      division: user.division || '',
      rollNo: user.rollNo || '',
      yearOfStudy: user.yearOfStudy || '',
    })
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Form/Display */}
      <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            {isEditing ? (
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                  placeholder="Enter your full name"
                />
              </div>
            ) : (
              <p className="text-gray-900">{user.name || '-'}</p>
            )}
          </div>

          {/* Year of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
            {isEditing ? (
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  name="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                >
                  <option value="">Select Year</option>
                  <option>First Year</option>
                  <option>Second Year</option>
                  <option>Third Year</option>
                  <option>Fourth Year</option>
                </select>
              </div>
            ) : (
              <p className="text-gray-900">{user.yearOfStudy || '-'}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <p className="text-gray-900">{user.email || '-'}</p>
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
            {isEditing ? (
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                  type="tel"
                  pattern="[0-9]{10,}"
                  className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                  placeholder="10-digit mobile number"
                />
              </div>
            ) : (
              <p className="text-gray-900">{user.mobile || '-'}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            {isEditing ? (
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            ) : (
              <p className="text-gray-900">{user.gender || '-'}</p>
            )}
          </div>

          {/* Department */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            {isEditing ? (
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
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
              </div>
            ) : (
              <p className="text-gray-900">{user.department || '-'}</p>
            )}
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
            {isEditing ? (
              <input
                name="division"
                value={form.division}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                placeholder="e.g. A, B, C"
              />
            ) : (
              <p className="text-gray-900">{user.division || '-'}</p>
            )}
          </div>

          {/* Roll No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
            {isEditing ? (
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  name="rollNo"
                  value={form.rollNo}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2"
                  placeholder="e.g. 21CE1001"
                />
              </div>
            ) : (
              <p className="text-gray-900">{user.rollNo || '-'}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}


