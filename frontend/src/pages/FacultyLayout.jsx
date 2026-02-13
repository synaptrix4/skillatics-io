import { useState } from 'react';
import FacultySidebar from '../components/FacultySidebar';
import { Menu } from 'lucide-react';

export default function FacultyLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <FacultySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 shadow-sm border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Skillatics</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
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
