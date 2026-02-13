import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, BookOpen, Code2, Code, Brain, Target, Trophy, FlaskConical, BarChart3, User, LogOut, Gamepad2 } from "lucide-react";
import { logout } from "../lib/auth";
import Logo from "./Logo";

export default function StudentSidebar({ isOpen, onClose }) {
  const location = useLocation();

  function handleLogout() {
    logout();
    window.location.href = '/login';
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white border-r border-gray-100 shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-sm
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <Logo className="h-10 w-auto" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Skillatics</h2>
              <p className="text-xs font-medium text-indigo-600">Student Portal</p>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-6">
            {/* Dashboard */}
            <div>
              <SidebarLink
                to="/student"
                icon={LayoutDashboard}
                label="Dashboard"
                isActive={location.pathname === '/student'}
                onClick={onClose}
              />
            </div>

            {/* Learning Section */}
            <SidebarSection title="Learning">
              <SidebarLink to="/student/general" icon={Brain} label="General Aptitude" isActive={location.pathname === '/student/general'} onClick={onClose} />
              <SidebarLink to="/student/technical" icon={Code2} label="Technical Aptitude" isActive={location.pathname === '/student/technical'} onClick={onClose} />
            </SidebarSection>

            {/* Coding Practice Section */}
            <SidebarSection title="Coding Practice">
              <SidebarLink to="/coding-practice" icon={Code} label="Practice Problems" isActive={location.pathname.startsWith('/coding-practice')} onClick={onClose} />
            </SidebarSection>

            {/* Adaptive Test Section */}
            <SidebarSection title="Adaptive Test">
              <SidebarLink to="/test" icon={Target} label="Take Test" isActive={location.pathname === '/test'} onClick={onClose} />
            </SidebarSection>

            {/* Gamified Assessment Section */}
            <SidebarSection title="Gamified Assessment">
              <SidebarLink to="/gamified-assessment" icon={Gamepad2} label="Play Games" isActive={location.pathname === '/gamified-assessment'} onClick={onClose} />
              <SidebarLink to="/analytics" icon={BarChart3} label="My Analytics" isActive={location.pathname === '/analytics'} onClick={onClose} />
              <SidebarLink to="/leaderboard" icon={Trophy} label="Leaderboard" isActive={location.pathname === '/leaderboard'} onClick={onClose} />
            </SidebarSection>

            {/* Profile */}
            <div className="pt-4 border-t border-gray-200">
              <SidebarLink to="/student/profile" icon={User} label="My Profile" isActive={location.pathname === '/student/profile'} onClick={onClose} />
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100/50 mb-3">
            <p className="text-xs font-bold text-indigo-900">Keep Learning!</p>
            <p className="mt-1 text-xs text-indigo-700/80">Track your progress and improve your skills daily.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Section Header Component
function SidebarSection({ title, children }) {
  return (
    <div>
      <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      <ul className="space-y-1 list-none">
        {children}
      </ul>
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ to, label, icon: Icon, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
        ? "bg-indigo-600 text-white shadow-soft shadow-indigo-500/30"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
      <span>{label}</span>
    </Link>
  );
}
