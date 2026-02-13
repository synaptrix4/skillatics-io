import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../lib/api'
import { getCurrentUser, saveAuth } from '../lib/auth'
import { User, Phone, Users, Building2, Hash, AlertCircle, Loader2, ArrowRight, GraduationCap } from 'lucide-react'

export default function CompleteProfile() {
  const user = getCurrentUser() || {}
  const [form, setForm] = useState({
    name: user.name || '',
    mobile: '',
    gender: '',
    department: '',
    division: '',
    rollNo: '',
    yearOfStudy: '',
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
      const redirect = role === 'Admin' ? '/admin' : (role === 'TPO' || role === 'Faculty') ? '/faculty' : '/student'
      window.location.href = redirect
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">Help us personalize your learning experience</p>
        </div>

        {/* Main Card */}
        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 shadow-xl">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Profile Setup</span>
              <span className="text-gray-500">Step 2 of 2</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-full rounded-full bg-indigo-600"></div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
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
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input 
                  name="mobile" 
                  value={form.mobile} 
                  onChange={handleChange} 
                  required 
                  className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2" 
                  type="tel" 
                  pattern="[0-9]{10,}"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
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
            </div>

            {/* Department */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
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
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
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
            </div>

            {/* Division */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
              <input 
                name="division" 
                value={form.division} 
                onChange={handleChange} 
                required 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none ring-indigo-500 transition-all focus:border-indigo-500 focus:ring-2" 
                placeholder="e.g. A, B, C" 
              />
            </div>

            {/* Roll No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
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
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                Save and Continue
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          This information helps us provide a personalized learning experience
        </p>
      </div>
    </div>
  )
}
