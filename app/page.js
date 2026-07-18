'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from './components/BottomNav';
import AnnouncementBanner from './components/AnnouncementBanner';

function NicknameButton() {
  const [nickname, setNickname] = useState('');
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vitloop_nickname');
    if (saved) setNickname(saved);
  }, []);

  const save = () => {
    if (!draft.trim()) return;
    localStorage.setItem('vitloop_nickname', draft.trim());
    setNickname(draft.trim());
    setShow(false);
    setDraft('');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setShow(!show); setDraft(nickname || ''); }}
        style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', fontWeight: '700', color: '#a78bfa', cursor: 'pointer' }}>
        🎭 {nickname || 'Set Nickname'}
      </button>
      {show && (
        <div style={{ position: 'absolute', right: 0, top: '36px', background: '#0d0d1a', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '12px', padding: '12px', width: '220px', zIndex: 200, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Your anonymous nickname</p>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
            placeholder="Jupiter, Naruto..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginBottom: '8px' }} autoFocus />
          <button onClick={save}
            style={{ width: '100%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '8px', padding: '8px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            Save Nickname ✓
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [showNicknamePopup, setShowNicknamePopup] = useState(false);
  const [nickDraft, setNickDraft] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vitloop_nickname');
    if (saved) {
      setNickname(saved);
    } else {
      setTimeout(() => setShowNicknamePopup(true), 800);
    }
  }, []);

  const saveNickname = (skip = false) => {
    if (!skip && !nickDraft.trim()) return;
    if (!skip) {
      localStorage.setItem('vitloop_nickname', nickDraft.trim());
      setNickname(nickDraft.trim());
    } else {
      localStorage.setItem('vitloop_nickname', 'Anonymous Vitian');
      setNickname('Anonymous Vitian');
    }
    setShowNicknamePopup(false);
  };

  const funNicknames = ['Jupiter', 'Naruto', 'Shadow', 'Phoenix', 'Cosmos', 'Ninja', 'Storm', 'Echo'];

  // 🔧 Swapped order: Tribe (formerly "Find a Friend / Vibe Match") now sits
  // where Faculty Review used to be — Faculty Review moved down one spot.
  // Also updated Tribe's tag from "Coming Soon" to "Live Now" since it's a
  // real, working feature now, and refreshed its title/description.
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
      href: '/profile',
      emoji: '🫂',
      title: 'Tribe',
      desc: 'Connect with VITians who match your vibe. Find your gang, new friends, or a hangout buddy — all anonymous.',
      color1: '#ec4899',
      color2: '#a855f7',
      tag: 'Live Now',
      tagColor: '#ec4899',
      tagBg: 'rgba(236,72,153,0.15)',
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
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #07070f 0%, #0d0d1a 60%, #07070f 100%)',
      fontFamily: "'Segoe UI', sans-serif",
      color: '#fff',
      paddingBottom: '90px',
    }}>

      {/* ===== NICKNAME POPUP ===== */}
      {showNicknamePopup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0d0d1a, #13132b)',
            border: '1px solid rgba(108,99,255,0.4)',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(108,99,255,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '150px', background: 'rgba(108,99,255,0.15)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}/>

            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎭</div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 8px', color: '#fff' }}>
              Pick Your Identity
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', lineHeight: '1.5' }}>
              Choose a fun nickname — this is what others will see.
            </p>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa', margin: '0 0 20px' }}>
              🔒 Don't use your real name — stay anonymous!
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
              {funNicknames.map(n => (
                <button key={n} onClick={() => setNickDraft(n)}
                  style={{
                    background: nickDraft === n ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${nickDraft === n ? 'rgba(108,99,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '100px',
                    padding: '5px 12px',
                    color: nickDraft === n ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  {n}
                </button>
              ))}
            </div>

            <input
              value={nickDraft}
              onChange={e => setNickDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveNickname()}
              placeholder="Or type your own nickname..."
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(108,99,255,0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: '12px',
                textAlign: 'center',
                fontWeight: '600',
              }}
              autoFocus
            />

            <button onClick={() => saveNickname()}
              style={{
                width: '100%',
                background: nickDraft.trim()
                  ? 'linear-gradient(135deg, #6C63FF, #00D4FF)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                color: nickDraft.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
                fontWeight: '800',
                fontSize: '15px',
                cursor: nickDraft.trim() ? 'pointer' : 'not-allowed',
                marginBottom: '10px',
                boxShadow: nickDraft.trim() ? '0 4px 20px rgba(108,99,255,0.4)' : 'none',
                transition: 'all 0.2s',
              }}>
              🚀 Enter VITLoop as "{nickDraft || '...'}"
            </button>

            <button onClick={() => saveNickname(true)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
              Skip for now (enter as Anonymous Vitian)
            </button>
          </div>
        </div>
      )}

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
        <NicknameButton />
      </nav>

      {/* 🔧 Admin-editable announcement — shows nothing for regular users
          until you publish one, and shows a subtle "+ Add announcement"
          prompt only when you're in admin mode. */}
      <AnnouncementBanner />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Trust banner */}
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
          <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'rgba(108,99,255,0.2)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }}/>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 6px', background: 'linear-gradient(135deg, #a78bfa, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>100% Anonymous</h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', lineHeight: '1.5' }}>
            No one knows who you are. Your identity is never revealed — not to us, not to anyone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['🚫 No Real Name', '📵 No Phone', '👁️ No Tracking'].map(b => (
              <span key={b} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '100px', padding: '4px 12px', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{b}</span>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Explore VITLoop</p>

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
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: `linear-gradient(180deg, ${f.color1}, ${f.color2})`, borderRadius: '18px 0 0 18px' }}/>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `linear-gradient(135deg, ${f.color1}22, ${f.color2}11)`, border: `1px solid ${f.color1}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, boxShadow: `0 4px 16px ${f.color1}22` }}>
                  {f.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#fff' }}>{f.title}</h3>
                    <span style={{ background: f.tagBg, color: f.tagColor, fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>{f.tag}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>{f.desc}</p>
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>›</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
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
