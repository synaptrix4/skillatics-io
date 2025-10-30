import StudentSidebar from '../components/StudentSidebar';

export default function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
