'use client';
// app/components/AvatarPicker.js
//
// 10 preset avatars — plain emoji, deliberately generic (no copyrighted
// characters, mascots, or branded IP) so this is completely safe for an
// app store review or a faculty demo. Used in the Vibe Match profile setup.

export const AVATARS = ['🦊','🐺','🦁','🐼','🐨','🦉','🐸','🐙','🦄','🐢'];

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {AVATARS.map((a) => (
        <button
          key={a}
          type="button"
          onClick={() => onSelect(a)}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: selected === a ? '2px solid #6C63FF' : '1px solid rgba(255,255,255,0.15)',
            background: selected === a ? 'rgba(108,99,255,0.2)' : 'rgba(255,255,255,0.05)',
          }}
        >
          {a}
        </button>
      ))}
    </div>
  );
}
