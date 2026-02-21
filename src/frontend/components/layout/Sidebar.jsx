import Logo from '../shared/Logo';

export default function Sidebar({ children }) {
  return (
    <aside className="w-80 min-h-screen bg-mint p-6 flex flex-col overflow-y-auto">
      <Logo className="mb-8" />
      <div className="flex flex-col gap-4 flex-1">
        {children}
      </div>
    </aside>
  );
}
