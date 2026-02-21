const variants = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800',
  secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50',
  outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
  green: 'bg-mint text-white hover:bg-mint',
};

export default function Button({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) {
  // don't override an explicit text size passed via className
  const hasTextSize = /(?:\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)\b)/.test(className);
  const textSizeClass = hasTextSize ? '' : 'text-sm';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-6 py-2.5 rounded-lg font-medium ${textSizeClass} transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
}
