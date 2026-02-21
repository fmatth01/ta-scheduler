export default function RoleToggle({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg overflow-hidden border border-gray-200">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`
            px-4 py-2 text-sm font-medium transition-colors cursor-pointer
            ${value === option
              ? 'bg-mint text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
