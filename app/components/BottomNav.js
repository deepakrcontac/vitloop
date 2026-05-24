'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const path = usePathname();

  const tabs = [
    { href: '/feed', icon: '🏪', label: 'Market' },
    { href: '/looprate', icon: '⭐', label: 'LoopRate' },
    { href: '/sell', icon: '➕', label: 'Sell', special: true },
    { href: '/chat', icon: '💬', label: 'Chats' },
    { href: '/profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
      background: 'rgba(13,13,13,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0 12px',
    }}>
      {tabs.map(tab => {
        const isActive = path === tab.href;
        return (
          <Link key={tab.href} href={tab.href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
            {tab.special ? (
              <div style={{
                width: '48px', height: '48px',
                background: 'linear-gradient(135deg, #c8f135, #a8d020)',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px',
                marginTop: '-20px',
                boxShadow: '0 4px 20px rgba(200,241,53,0.4)',
              }}>{tab.icon}</div>
            ) : (
              <div style={{
                fontSize: '22px',
                opacity: isActive ? 1 : 0.4,
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s',
              }}>{tab.icon}</div>
            )}
            <span style={{
              fontSize: '10px',
              fontWeight: '700',
              color: isActive ? '#c8f135' : 'rgba(255,255,255,0.4)',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}