export default function Logo({ size = 'md' }) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const px = sizes[size] || 48;

  return (
    <svg width={px} height={px} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="loopGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C63FF"/>
          <stop offset="100%" stopColor="#00D4FF"/>
        </linearGradient>
      </defs>
      {/* Hexagon base */}
      <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="url(#loopGrad)" opacity="0.15" stroke="url(#loopGrad)" strokeWidth="2"/>
      {/* Loop arrow top-right */}
      <path d="M20 22 Q32 10 44 22" stroke="url(#loopGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <polygon points="44,22 40,16 49,17" fill="#6C63FF"/>
      {/* Loop arrow bottom-left */}
      <path d="M44 42 Q32 54 20 42" stroke="url(#loopGrad)" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <polygon points="20,42 24,48 15,47" fill="#00D4FF"/>
      {/* Center VL monogram */}
      <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill="url(#loopGrad)">VL</text>
    </svg>
  );
}