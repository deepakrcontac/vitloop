// app/components/AvatarIcon.js
//
// Real SVG avatars instead of emoji — renders identically on every device
// (emoji look different across iOS/Android/Windows; this won't).

export default function AvatarIcon({ gender, size = 32 }) {
  const isFemale = gender === 'Female';
  const bg = isFemale ? '#ec4899' : '#00D4FF';
  const bgFaint = isFemale ? 'rgba(236,72,153,0.15)' : 'rgba(0,212,255,0.15)';

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r="20" fill={bgFaint} />
      <circle cx="20" cy="20" r="20" fill="none" stroke={bg} strokeWidth="1.5" />
      {/* head */}
      <circle cx="20" cy="16" r="6.5" fill={bg} />
      {/* body */}
      <path d="M8 34c0-7 5.5-11 12-11s12 4 12 11" fill={bg} />
      {isFemale && (
        // simple hair swoop to visually differentiate, nothing stereotyped beyond a hairstyle silhouette
        <path d="M13.5 14c-0.5-4 2-7 6.5-7s7 3 6.5 7c-0.5-2-2-3-3-2c-1-2-3-2.5-3.5-1c-1-1.5-3-1-3.5 1c-1-1-2 0-2.5 2z" fill={bg} />
      )}
    </svg>
  );
}
