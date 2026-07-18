'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const path = usePathname();

  // 🔧 Tribe (formerly Vibe Match) moved to the center slot, Faculty moved
  // to the last position. Tribe also gets special "raised, bigger" styling
  // below — same visual pattern as Instagram's center "+" button.
  const tabs = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/chat', icon: '💬', label: 'Chats' },
    { href: '/profile', icon: '🫂', label: 'Tribe' },
    { href: '/feed', icon: '🏪', label: 'Market' },
    { href: '/looprate', icon: '⭐', label: 'Faculty' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      padding: '0 12px 10px',
      background: 'transparent',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(10,10,20,0.92)',
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        padding: '10px 8px',
        pointerEvents: 'all',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {tabs.map(tab => {
          const isActive = path === tab.href ||
            (tab.href !== '/' && path?.startsWith(tab.href));
          const isTribe = tab.href === '/profile';

          return (
            <Link key={tab.href} href={tab.href} style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              flex: 1,
              padding: '4px 0',
            }}>
              <div style={{
                width: isTribe ? '58px' : '42px',
                height: isTribe ? '50px' : '36px',
                borderRadius: isTribe ? '18px' : '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isTribe ? '26px' : '20px',
                marginTop: isTribe ? '-16px' : '0',
                background: isTribe
                  ? 'linear-gradient(135deg, #ec4899, #a855f7)'
                  : isActive
                    ? 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))'
                    : 'transparent',
                border: isTribe
                  ? '1px solid rgba(236,72,153,0.6)'
                  : isActive
                    ? '1px solid rgba(108,99,255,0.4)'
                    : '1px solid transparent',
                boxShadow: isTribe
                  ? '0 6px 24px rgba(236,72,153,0.5), 0 0 0 4px rgba(10,10,20,0.92)'
                  : isActive
                    ? '0 0 12px rgba(108,99,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : 'none',
                transform: isActive && !isTribe ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                {tab.icon}
              </div>
              <span style={{
                fontSize: isTribe ? '9.5px' : '9px',
                fontWeight: isTribe ? '800' : '700',
                color: isTribe
                  ? '#f472b6'
                  : isActive ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
