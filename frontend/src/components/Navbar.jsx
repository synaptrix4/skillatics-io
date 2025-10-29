import { Link } from 'react-router-dom'
import { getCurrentUser, logout } from '../lib/auth'

export default function Navbar() {
  const user = getCurrentUser()
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-page flex h-14 items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 font-semibold">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-600"></span>
          Skillatics
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {!user && <Link className="hover:text-indigo-600" to="/login">Login</Link>}
          {user && user.role === 'Student' && <Link className="hover:text-indigo-600" to="/test">Adaptive Test</Link>}
          {user && user.role === 'Student' && <Link className="hover:text-indigo-600" to="/student">Student</Link>}
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


