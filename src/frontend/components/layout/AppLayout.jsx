import Sidebar from './Sidebar';

export default function AppLayout({ sidebar, children }) {
  return (
    <div className="flex h-screen">
      <Sidebar>{sidebar}</Sidebar>
      <main className="flex-1 overflow-y-auto p-8 bg-white">
        {children}
      </main>
    </div>
  );
}
