export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
        <span className="text-white text-sm font-bold">Q</span>
      </div>
      <span className="text-lg font-semibold text-gray-900">ISpyScheduling</span>
    </div>
  );
}
