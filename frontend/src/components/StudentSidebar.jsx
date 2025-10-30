import { Link, useLocation } from "react-router-dom";

export default function StudentSidebar() {
  const location = useLocation();
  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }
  return (
    <aside className="w-64 bg-white border-r shadow-sm h-full flex-shrink-0 hidden md:flex flex-col">
      <div className="p-6 text-xl font-bold text-indigo-700 mb-2">Skillatics</div>
      <nav className="flex-1">
        <ul className="space-y-1">
          <SidebarLink to="/student" text="Dashboard" active={isActive("/student") && location.pathname === "/student"} />
          <SidebarLink to="/student/general" text="Learn General Aptitude" active={isActive("/student/general")}/>
          <SidebarLink to="/student/technical" text="Learn Technical Aptitude" active={isActive("/student/technical")}/>
          <SidebarLink to="/test" text="Adaptive Test" active={isActive("/test")}/>
          <SidebarLink to="/analytics" text="Analytics" active={isActive("/analytics")}/>
        </ul>
      </nav>
    </aside>
  );
}

function SidebarLink({ to, text, active }) {
  return (
    <li>
      <Link
        to={to}
        className={`block px-6 py-2 rounded text-sm font-medium hover:bg-indigo-50 ${active ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-700"}`}
      >
        {text}
      </Link>
    </li>
  );
}
