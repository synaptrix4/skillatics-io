import { Link } from 'react-router-dom'
import { getCurrentUser, logout } from '../lib/auth'
import Brand from './Brand'

export default function Navbar() {
  const user = getCurrentUser()
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <Brand size="md" />
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {!user && <Link className="hover:text-indigo-600" to="/login">Login</Link>}
          {!user && <Link className="hover:text-indigo-600" to="/register">Register</Link>}
          {user && user.role === 'Student' && <Link className="hover:text-indigo-600" to="/student">Learn</Link>}
          {user && user.role === 'Student' && <Link className="hover:text-indigo-600" to="/test">Adaptive Test</Link>}
          {user && user.role === 'Student' && <Link className="hover:text-indigo-600" to="/analytics">Analytics</Link>}
          {user && user.role === 'TPO/Faculty' && <Link className="hover:text-indigo-600" to="/faculty">TPO/Faculty</Link>}
          {user && user.role === 'Admin' && <Link className="hover:text-indigo-600" to="/admin">Admin</Link>}
          {user && (
            <button
              onClick={() => { logout(); window.location.href = '/login' }}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800"
            >
              Logout ({user.name})
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}


