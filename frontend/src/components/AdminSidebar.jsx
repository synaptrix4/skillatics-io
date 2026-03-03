import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-white border-r border-slate-100 shadow-xl transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3" onClick={onClose}>
            <Logo className="h-10 w-auto" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Admin Panel</h2>
              <p className="text-xs font-semibold text-orange-600">Skillatics</p>
            </div>
          </Link>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <SidebarSection title="MANAGEMENT">
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
          </SidebarSection>
        </nav>
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all duration-300 hover:bg-red-50 hover:text-red-600 group"
          >
            <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

function SidebarLink({ to, text, icon: Icon, active, onClick }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={`group flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-300 relative overflow-hidden ${active
          ? "text-slate-900 font-semibold"
          : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
      >
        {/* Active Background & Border Effects */}
        {active && (
          <motion.div
            layoutId="adminSidebarActiveTab"
            className="absolute inset-0 bg-orange-50/80 border-l-[3px] border-orange-500 rounded-r-xl"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Hover Background for inactive tabs */}
        {!active && (
          <div className="absolute inset-0 bg-slate-50/80 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        )}

        <div className="relative flex items-center gap-3 z-10 w-full">
          <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-500'}`} />
          <span>{text}</span>
        </div>
      </Link>
    </li>
  );
}




