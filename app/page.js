'use client';
import { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomNav from './components/BottomNav';

export default function Home() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      if (!u) router.push('/login');
      else setUser(u);
    });
    return () => unsub();
  }, []);

  if (!user) return null;

  const features = [
    {
      href: '/chat',
      emoji: '💬',
      title: 'Help Board',
      desc: 'Ask anything anonymously. Seniors will answer your doubts about VIT life, courses, exams and more.',
      color1: '#6C63FF',
      color2: '#00D4FF',
      tag: 'Ask Seniors',
      tagColor: '#a78bfa',
      tagBg: 'rgba(108,99,255,0.2)',
    },
    {
      href: '/feed',
      emoji: '🏪',
      title: 'Marketplace',
      desc: 'Buy, sell or rent things on campus. Books, gadgets, furniture — all anonymous, zero contact info needed.',
      color1: '#c8f135',
      color2: '#a8d020',
      tag: 'Buy & Sell',
      tagColor: '#c8f135',
      tagBg: 'rgba(200,241,53,0.15)',
    },
    {
      href: '/looprate',
      emoji: '⭐',
      title: 'Faculty Review',
      desc: 'Rate your professors honestly. Help juniors pick the right faculty. Speak freely — no one knows it\'s you.',
      color1: '#f59e0b',
      color2: '#ff5c35',
      tag: 'Rate Faculty',
      tagColor: '#f59e0b',
      tagBg: 'rgba(245,158,11,0.15)',
    },
    {
      href: '/profile',
      emoji: '🤝',
      title: 'Find a Friend',
      desc: 'Connect with VITians who match your vibe. List your interests and find your people on campus.',
      color1: '#ec4899',
      color2: '#a855f7',
      tag: 'Coming Soon',
      tagColor: '#ec4899',
      tagBg: 'rgba(236,72,153,0.15)',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #07070f 0%, #0d0d1a 60%, #07070f 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      color: '#fff',
      paddingBottom: '90px',
    }}>

      {/* NAV */}
      <nav style={{
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7,7,15,0.97)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c8f135"/>
                <stop offset="100%" stopColor="#ff5c35"/>
              </linearGradient>
            </defs>
            <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="url(#hg)" opacity="0.15" stroke="url(#hg)" strokeWidth="2"/>
            <path d="M20 22 Q32 10 44 22" stroke="url(#hg)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <polygon points="44,22 40,16 49,17" fill="#c8f135"/>
            <path d="M44 42 Q32 54 20 42" stroke="url(#hg)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <polygon points="20,42 24,48 15,47" fill="#ff5c35"/>
            <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill="url(#hg)">VL</text>
          </svg>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            VIT<span style={{ color: '#ff5c35' }}>Loop</span>
          </span>
        </div>
        <div style={{
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '20px',
          padding: '5px 12px',
          fontSize: '11px',
          fontWeight: '700',
          color: '#a78bfa',
        }}>🔒 Anonymous Mode</div>
      </nav>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* TRUST BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.08))',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '200px',
            height: '100px',
            background: 'rgba(108,99,255,0.2)',
            borderRadius: '50%',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}/>

          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '900',
            margin: '0 0 6px',
            background: 'linear-gradient(135deg, #a78bfa, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>100% Anonymous</h1>
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 14px',
            lineHeight: '1.5',
          }}>No one knows who you are. Your identity is never revealed — not to us, not to anyone.</p>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['🚫 No Real Name', '📵 No Phone', '👁️ No Tracking'].map(b => (
              <span key={b} style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '100px',
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'rgba(255,255,255,0.7)',
              }}>{b}</span>
            ))}
          </div>
        </div>

        {/* SECTION TITLE */}
        <p style={{
          fontSize: '11px',
          fontWeight: '700',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>Explore VITLoop</p>

        {/* FEATURE BOXES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {features.map((f, i) => (
            <Link key={i} href={f.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
                padding: '18px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = `${f.color1}44`;
                e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${f.color1}22`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(1px) scale(0.99)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              >
                {/* Left glow line */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  background: `linear-gradient(180deg, ${f.color1}, ${f.color2})`,
                  borderRadius: '18px 0 0 18px',
                }}/>

                {/* Emoji box */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${f.color1}22, ${f.color2}11)`,
                  border: `1px solid ${f.color1}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0,
                  boxShadow: `0 4px 16px ${f.color1}22`,
                }}>
                  {f.emoji}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#fff' }}>{f.title}</h3>
                    <span style={{
                      background: f.tagBg,
                      color: f.tagColor,
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '100px',
                    }}>{f.tag}</span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                    lineHeight: '1.5',
                  }}>{f.desc}</p>
                </div>

                {/* Arrow */}
                <div style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}>›</div>
              </div>
            </Link>
          ))}
        </div>

        {/* BOTTOM NOTE */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6' }}>
            🎓 Made by a VITian, for VITians<br/>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>Your campus. Your rules. Your privacy.</span>
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}