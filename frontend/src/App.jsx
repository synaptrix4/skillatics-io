import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import LandingPage from './pages/LandingPage'
import Test from './pages/Test'
import CodingTestPage from './pages/CodingTestPage'
import CodingProblemsPage from './pages/CodingProblemsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import GamifiedAssessment from './pages/GamifiedAssessment'
import GameSession from './pages/GameSession'
import SQLDetective from './pages/games/SQLDetective'
import CodeQuest from './pages/games/CodeQuest'
import LogicLabyrinth from './pages/games/LogicLabyrinth'
import DebugDungeon from './pages/games/DebugDungeon'
import StudentLearnDashboard from './pages/StudentLearnDashboard'
import StudentGeneralLearnDashboard from './pages/StudentGeneralLearnDashboard'
import StudentTechnicalLearnDashboard from './pages/StudentTechnicalLearnDashboard'
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import FacultyDashboard from './pages/FacultyDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ManageUsers from './pages/ManageUsers'
import TopicDetailsPage from './pages/TopicDetailsPage'
import StudentProfile from './pages/StudentProfile'
import { getCurrentUser } from './lib/auth'
import Navbar from './components/Navbar'
import Page from './components/Page'
import StudentLayout from './pages/StudentLayout'
import AdminLayout from './pages/AdminLayout'
import CompleteProfile from './pages/CompleteProfile'
import AdminTopics from './pages/AdminTopics'
import AdminQuestions from './pages/AdminQuestions'
import FacultyLayout from './pages/FacultyLayout'
import FacultyProfile from './pages/FacultyProfile'
import AdminProfile from './pages/AdminProfile'

function Protected({ children, roles }) {
    const user = getCurrentUser()
    if (!user) return <Navigate to="/login" />
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />
    return children
}

export default function App() {
    const location = useLocation()
    const user = getCurrentUser()

    // Hide global navbar on dashboard routes where Sidebar is present
    const isDashboard = ['/student', '/admin', '/faculty'].some(path => location.pathname.startsWith(path))
    const shouldShowNavbar = !isDashboard && !(location.pathname === '/' && !user)

    return (
        <div className="min-h-screen font-sans text-gray-900">
            {shouldShowNavbar && <Navbar />}
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<HomeOrRedirect />} />
                    <Route path="/login" element={<Page><LoginPage /></Page>} />
                    <Route path="/register" element={<Page><RegisterPage /></Page>} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                    <Route path="/test" element={<Protected roles={['Student']}><StudentLayout><Test /></StudentLayout></Protected>} />
                    <Route path="/coding-practice" element={<Protected roles={['Student']}><StudentLayout><CodingProblemsPage /></StudentLayout></Protected>} />
                    <Route path="/coding-practice/:id" element={<Protected roles={['Student']}><StudentLayout><CodingTestPage /></StudentLayout></Protected>} />
                    <Route path="/leaderboard" element={<Protected roles={['Student']}><StudentLayout><LeaderboardPage /></StudentLayout></Protected>} />
                    <Route path="/gamified-assessment" element={<Protected roles={['Student']}><StudentLayout><GamifiedAssessment /></StudentLayout></Protected>} />
                    <Route path="/gamified-assessment/play/:modeId" element={<Protected roles={['Student']}><GameSession /></Protected>} />
                    <Route path="/games/sql-detective" element={<Protected roles={['Student']}><SQLDetective /></Protected>} />
                    <Route path="/games/code-quest" element={<Protected roles={['Student']}><CodeQuest /></Protected>} />
                    <Route path="/games/logic-labyrinth" element={<Protected roles={['Student']}><LogicLabyrinth /></Protected>} />
                    <Route path="/games/debug-dungeon" element={<Protected roles={['Student']}><DebugDungeon /></Protected>} />
                    <Route path="/student" element={<Protected roles={['Student']}><StudentLayout><StudentLearnDashboard /></StudentLayout></Protected>} />
                    <Route path="/student/profile" element={<Protected roles={['Student']}><StudentLayout><StudentProfile /></StudentLayout></Protected>} />
                    <Route path="/student/general" element={<Protected roles={['Student']}><StudentLayout><StudentGeneralLearnDashboard /></StudentLayout></Protected>} />
                    <Route path="/student/technical" element={<Protected roles={['Student']}><StudentLayout><StudentTechnicalLearnDashboard /></StudentLayout></Protected>} />
                    <Route path="/analytics" element={<Protected roles={['Student']}><StudentLayout><AnalyticsDashboard /></StudentLayout></Protected>} />
                    <Route path="/learn/topic/:topicId" element={<Protected roles={['Student']}><StudentLayout><TopicDetailsPage /></StudentLayout></Protected>} />
                    <Route path="/faculty" element={<Protected roles={['TPO', 'Faculty', 'Admin']}><FacultyLayout><FacultyDashboard /></FacultyLayout></Protected>} />
                    <Route path="/faculty/profile" element={<Protected roles={['TPO', 'Faculty', 'Admin']}><FacultyLayout><FacultyProfile /></FacultyLayout></Protected>} />
                    <Route path="/admin" element={<Protected roles={['Admin']}><AdminLayout><AdminDashboard /></AdminLayout></Protected>} />
                    <Route path="/admin/profile" element={<Protected roles={['Admin']}><AdminLayout><AdminProfile /></AdminLayout></Protected>} />
                    <Route path="/admin/manage-users" element={<Protected roles={['Admin']}><AdminLayout><ManageUsers /></AdminLayout></Protected>} />
                    <Route path="/admin/topics" element={<Protected roles={['Admin']}><AdminLayout><AdminTopics /></AdminLayout></Protected>} />
                    <Route path="/admin/questions" element={<Protected roles={['Admin']}><AdminLayout><AdminQuestions /></AdminLayout></Protected>} />
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
    if (!user) return <LandingPage />
    const role = user.role
    const to = role === 'Admin' ? '/admin' : (role === 'TPO' || role === 'Faculty') ? '/faculty' : '/student'
    return <Navigate to={to} />
}


