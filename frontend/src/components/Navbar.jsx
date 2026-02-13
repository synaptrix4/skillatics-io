import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUser, logout, saveAuth } from '../lib/auth'
import { refreshToken } from '../lib/api'
import Brand from './Brand'
import { BookOpen, BarChart3, LayoutDashboard, Settings, LogOut, RefreshCw, User, ChevronDown, UserCircle } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleRefreshToken() {
    try {
      const resp = await refreshToken()
      saveAuth(resp.data.token, resp.data.user)
      window.location.reload()
    } catch (err) {
      console.error('Failed to refresh token:', err)
    }
  }

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  function goToProfile() {
    setDropdownOpen(false)
    if (user.role === 'Student') {
      navigate('/student/profile')
    }
    // Add other role profile pages when available
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 font-semibold transition-opacity hover:opacity-80">
          <Brand size="md" theme="dark" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {/* Guest Links */}
          {!user && (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Student Links */}
          {user && user.role === 'Student' && (
            <>
              <Link
                to="/student"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <BookOpen className="h-4 w-4" />
                Learn
              </Link>
              <Link
                to="/test"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <BarChart3 className="h-4 w-4" />
                Test
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </>
          )}

          {/* Faculty/TPO Links */}
          {user && (user.role === 'TPO' || user.role === 'Faculty') && (
            <Link
              to="/faculty"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}

          {/* Admin Links */}
          {user && user.role === 'Admin' && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          )}

          {/* User Menu */}
          {user && (
            <div className="relative ml-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <User className="h-4 w-4" />
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        {user.role}
                      </span>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={goToProfile}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <UserCircle className="h-4 w-4" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          handleRefreshToken()
                          setDropdownOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                        title="Refresh your session if your role was changed"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Refresh Session
                      </button>
                      <button
                        onClick={() => {
                          handleLogout()
                          setDropdownOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}


