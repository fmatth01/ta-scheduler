import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className} cursor-pointer`}>
      <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
        <FontAwesomeIcon icon={faMagnifyingGlass} style={{color: "rgb(255, 255, 255)"}} />
      </div>
      <span className="text-xl font-semibold text-gray-900">ISpyScheduling</span>
    </Link>
  );
}
