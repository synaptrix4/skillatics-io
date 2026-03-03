import { useState } from 'react';
import FacultySidebar from '../components/FacultySidebar';
import { Menu } from 'lucide-react';
import AmbientBackground from '../components/AmbientBackground';
import DashboardNavbar from '../components/DashboardNavbar';

export default function FacultyLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-white relative overflow-hidden">
            <AmbientBackground />
            <FacultySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 bg-slate-50">
                <DashboardNavbar />

                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white/80 backdrop-blur-xl px-4 py-3 shadow-sm border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 tracking-tight">Skillatics</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">{children}</div>
                </div>
            </main>
        </div>
    );
}
