'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const path = usePathname();

  const tabs = [
    { href: '/', icon: '🏠', label: 'Home' },
    { href: '/chat', icon: '💬', label: 'Chats' },
    { href: '/looprate', icon: '⭐', label: 'Faculty' },
    { href: '/feed', icon: '🏪', label: 'Market' },
    { href: '/profile', icon: '👤', label: 'Profile' },
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
        alignItems: 'center',
        padding: '10px 8px',
        pointerEvents: 'all',
        boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {tabs.map(tab => {
          const isActive = path === tab.href ||
            (tab.href !== '/' && path?.startsWith(tab.href));
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
                width: '42px',
                height: '36px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(108,99,255,0.4)'
                  : '1px solid transparent',
                boxShadow: isActive
                  ? '0 0 12px rgba(108,99,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : 'none',
                transform: isActive ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                {tab.icon}
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: '700',
                color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.3)',
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