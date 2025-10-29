import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Test from './pages/Test'
import StudentDashboard from './pages/StudentDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ManageUsers from './pages/ManageUsers'
import { getCurrentUser } from './lib/auth'
import Navbar from './components/Navbar'
import Page from './components/Page'

function Protected({ children, roles }) {
	const user = getCurrentUser()
	if (!user) return <Navigate to="/login" />
	if (roles && !roles.includes(user.role)) return <Navigate to="/" />
	return children
}

export default function App() {
    const location = useLocation()
    return (
        <div className="min-h-screen">
            <Navbar />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<HomeOrRedirect />} />
                    <Route path="/login" element={<Page><Login /></Page>} />
                    <Route path="/test" element={<Page><Protected><Test /></Protected></Page>} />
                    <Route path="/student" element={<Page><Protected roles={['Student']}><StudentDashboard /></Protected></Page>} />
                    <Route path="/faculty" element={<Page><Protected roles={['TPO/Faculty','Admin']}><FacultyDashboard /></Protected></Page>} />
                    <Route path="/admin" element={<Page><Protected roles={['Admin']}><AdminDashboard /></Protected></Page>} />
                    <Route path="/admin/manage-users" element={<Page><Protected roles={['Admin']}><ManageUsers /></Protected></Page>} />
                </Routes>
            </AnimatePresence>
        </div>
    )
}

function HeroHome() {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to Skillatics</h1>
                <p className="mt-3 text-gray-600">Adaptive testing and analytics to level up learning.</p>
            </div>
        </div>
    )
}

function HomeOrRedirect() {
    const user = getCurrentUser()
    if (!user) return <Page><LandingPage /></Page>
    const role = user.role
    const to = role === 'Admin' ? '/admin' : role === 'TPO/Faculty' ? '/faculty' : '/student'
    return <Navigate to={to} />
}


