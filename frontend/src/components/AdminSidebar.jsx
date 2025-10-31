import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, BookOpen, FileQuestion, Shield } from "lucide-react";

export default function AdminSidebar() {
  const location = useLocation();
  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }
  
  const navItems = [
    { to: "/admin", text: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/manage-users", text: "Users", icon: Users },
    { to: "/admin/topics", text: "Topics", icon: BookOpen },
    { to: "/admin/questions", text: "Questions", icon: FileQuestion },
  ];
  
  return (
    <aside className="w-64 bg-white border-r shadow-sm h-screen sticky top-0 flex-shrink-0 hidden md:flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">Skillatics</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <SidebarLink 
              key={item.to}
              to={item.to} 
              text={item.text} 
              icon={item.icon}
              active={item.exact ? location.pathname === item.to : isActive(item.to)} 
            />
          ))}
        </ul>
      </nav>
      <div className="border-t p-4">
        <div className="rounded-lg bg-indigo-50 p-3">
          <p className="text-xs font-medium text-indigo-900">Need Help?</p>
          <p className="mt-1 text-xs text-indigo-700">Check the documentation</p>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ to, text, icon: Icon, active }) {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          active 
            ? "bg-indigo-600 text-white shadow-sm" 
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{text}</span>
      </Link>
    </li>
  );
}




