import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, FileQuestion, User, LogOut } from "lucide-react";
import { logout } from "../lib/auth";
import Logo from "./Logo";

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();
  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  const navItems = [
    { to: "/admin", text: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/manage-users", text: "Users", icon: Users },
    { to: "/admin/topics", text: "Topics", icon: BookOpen },
    { to: "/admin/questions", text: "Questions", icon: FileQuestion },
    { to: "/admin/profile", text: "Profile", icon: User },
  ];

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
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Admin Panel</h2>
              <p className="text-xs font-medium text-gray-500">Skillatics</p>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                text={item.text}
                icon={item.icon}
                active={item.exact ? location.pathname === item.to : isActive(item.to)}
                onClick={onClose}
              />
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-100 p-4">
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

function SidebarLink({ to, text, icon: Icon, active, onClick }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${active
          ? "bg-indigo-600 text-white shadow-soft shadow-indigo-500/30"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          }`}
      >
        <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
        <span>{text}</span>
      </Link>
    </li>
  );
}




