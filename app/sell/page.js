'use client';
import Link from 'next/link';
import BottomNav from './components/BottomNav';

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0a; font-family: 'DM Sans', sans-serif; }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 300px; height: 300px; background: rgba(0,200,80,0.12); top: -80px; right: -60px; }
        .blob-2 { width: 200px; height: 200px; background: rgba(0,255,120,0.07); bottom: 100px; left: -60px; }
        .card-hover:hover { border-color: rgba(0,200,80,0.3) !important; }
        .dot { width: 6px; height: 6px; background: #00e667; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
      `}</style>

      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingBottom: '100px', paddingTop: '20px' }}>
        <div style={{ width: '100%', maxWidth: '540px', background: '#0d1117', borderRadius: '28px', overflow: 'hidden', position: 'relative', border: '1px solid #1e2a1e', boxShadow: '0 0 80px rgba(0,200,80,0.08), 0 40px 80px rgba(0,0,0,0.6)', margin: '0 16px' }}>

          <div className="blob blob-1" />
          <div className="blob blob-2" />

          {/* HEADER */}
          <div style={{ position: 'relative', zIndex: 1, padding: '36px 36px 24px', borderBottom: '1px solid #1a2a1a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0,200,80,0.12)', border: '1px solid rgba(0,200,80,0.25)', borderRadius: '100px', padding: '6px 14px', fontSize: '13px', color: '#4dff90', fontWeight: '600', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🐸 For VIT Students, By VIT Students
              </div>
            </div>

            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '52px', fontWeight: '800', lineHeight: 1, color: '#fff', letterSpacing: '-2px' }}>
              Vit<span style={{ color: '#00e667' }}>Loop</span>
            </div>
            <div style={{ fontSize: '15px', color: '#6b7f6b', marginTop: '8px', fontWeight: '500' }}>
              The anonymous platform built for the VIT community
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
              {[
                { label: '✅ 100% Anonymous', green: true },
                { label: '🔓 No Login Required', green: true },
                { label: '🌐 Open to All VITians', green: false },
              ].map(b => (
                <div key={b.label} style={{ background: b.green ? 'rgba(0,200,80,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${b.green ? 'rgba(0,200,80,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', padding: '5px 12px', fontSize: '12px', color: b.green ? '#4dff90' : '#8fa88f', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* BODY */}
          <div style={{ position: 'relative', zIndex: 1, padding: '28px 36px' }}>
            <div style={{ fontSize: '22px', fontWeight: '600', color: '#e8f5e8', lineHeight: 1.45, marginBottom: '24px' }}>
              Facing unfair treatment from faculty?<br />
              <span style={{ color: '#00e667' }}>Speak up freely — your identity is fully protected.</span>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', color: '#3d5c3d', textTransform: 'uppercase', marginBottom: '10px' }}>💸 Earn & Connect on Campus</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { icon: '🔄', title: 'Rent Items', desc: 'Rent things to fellow students easily', href: '/feed' },
                  { icon: '🤝', title: 'Vibe Match', desc: 'Find friends who match your vibe', href: '/profile' },
                  { icon: '🛍️', title: 'Buy & Sell', desc: 'Share useful items within campus', href: '/feed' },
                  { icon: '🔒', title: 'Stay Safe', desc: 'Total anonymity, always protected', href: '/' },
                ].map(card => (
                  <Link key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
                    <div className="card-hover" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 16px', transition: 'border-color 0.2s', cursor: 'pointer' }}>
                      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{card.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#cfe8cf', marginBottom: '2px' }}>{card.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#4d644d', lineHeight: 1.4 }}>{card.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #1e2e1e, transparent)', margin: '4px 0 22px' }} />

            {/* FFCS BOX */}
            <Link href="/looprate" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(0,200,80,0.07), rgba(0,100,40,0.05))', border: '1px solid rgba(0,200,80,0.15)', borderRadius: '14px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div style={{ fontSize: '26px', flexShrink: 0, marginTop: '2px' }}>📚</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#4dff90', marginBottom: '4px', letterSpacing: '0.02em' }}>FFCS Faculty Reviews</div>
                  <p style={{ fontSize: '12px', color: '#5a7a5a', lineHeight: 1.5 }}>
                    Use the <strong style={{ color: '#cfe8cf' }}>Add Faculty</strong> feature to rate & review professors. Help fellow VITians make smarter choices during FFCS — based on real student experiences.
                  </p>
                </div>
              </div>
            </Link>

            {/* HELP BOARD */}
            <Link href="/chat" style={{ textDecoration: 'none', display: 'block', marginTop: '10px' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.07), rgba(0,212,255,0.04))', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '14px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start', cursor: 'pointer' }}>
                <div style={{ fontSize: '26px', flexShrink: 0, marginTop: '2px' }}>💬</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#a78bfa', marginBottom: '4px', letterSpacing: '0.02em' }}>Help Board</div>
                  <p style={{ fontSize: '12px', color: '#5a5a7a', lineHeight: 1.5 }}>
                    Ask anything anonymously. <strong style={{ color: '#cfe8cf' }}>Seniors will answer</strong> your doubts about VIT life, courses, exams and more.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* FOOTER */}
          <div style={{ position: 'relative', zIndex: 1, padding: '20px 36px 28px', borderTop: '1px solid #1a2a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: '700', color: '#00e667', letterSpacing: '0.02em' }}>
              <span style={{ color: '#2a4a2a' }}>🌐 </span>vitloop.vercel.app
            </div>
            <div style={{ background: 'rgba(0,200,80,0.1)', border: '1px solid rgba(0,200,80,0.25)', borderRadius: '100px', padding: '7px 16px', fontSize: '12px', fontWeight: '600', color: '#4dff90', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="dot" /> Anonymous & Free
            </div>
          </div>

        </div>
      </div>

      <BottomNav />
    </>
  );
}