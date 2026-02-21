import Logo from '../shared/Logo';

export default function LoginLayout({ children }) {
  return (
    <div className="flex h-screen">
      <div className="w-[40%] bg-gradient-to-b from-mint-200 to-mint-100 relative flex flex-col items-center justify-end overflow-hidden">
        <Logo className="absolute top-6 left-6" />
        {/* TODO: Replace with actual illustration asset provided by design team */}
        <div className="w-64 h-64 mb-12 opacity-80">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <ellipse cx="100" cy="180" rx="80" ry="20" fill="#2dd4ad" opacity="0.3" />
            <rect x="60" y="80" width="80" height="90" rx="10" fill="#14b892" />
            <circle cx="100" cy="70" r="30" fill="#f0fdf9" />
            <circle cx="90" cy="65" r="4" fill="#1a1a1a" />
            <circle cx="110" cy="65" r="4" fill="#1a1a1a" />
            <path d="M 90 78 Q 100 88 110 78" stroke="#1a1a1a" strokeWidth="2" fill="none" />
            <path d="M 70 55 Q 100 30 130 55" stroke="#1a1a1a" strokeWidth="3" fill="#374151" />
          </svg>
        </div>
      </div>
      <div className="w-[60%] bg-white flex flex-col items-center justify-center px-16">
        {children}
      </div>
    </div>
  );
}
