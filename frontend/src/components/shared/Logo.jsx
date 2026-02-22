import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className} cursor-pointer`}>
      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
        <span className="text-white text-xl font-bold">🔍</span>
      </div>
      <span className="text-xl font-semibold text-gray-900">ISpyScheduling</span>
    </Link>
  );
}
