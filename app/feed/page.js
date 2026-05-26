'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import {
  collection, getDocs, addDoc, deleteDoc, doc,
  orderBy, query, serverTimestamp, updateDoc, arrayUnion, onSnapshot
} from 'firebase/firestore';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['All', '🏠 Hostellers', '🚌 Day Scholars'];
const COLORS = ['#6C63FF','#00D4FF','#ff5c35','#c8f135','#f59e0b','#ec4899','#10b981'];
const getColor = (uid) => COLORS[(uid?.charCodeAt(0) || 0) % COLORS.length];
const ADMIN_EMAILS = ['deepak.2024a@vitstudent.ac.in', 'deepak.rcontact@gmail.com'];

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [newQ, setNewQ] = useState('');
  const [posting, setPosting] = useState(false);
  const [openReply, setOpenReply] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [showAllQ, setShowAllQ] = useState(false);
  const user = auth.currentUser;
  const router = useRouter();
  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  useEffect(() => {
    fetchListings();
    const q = query(collection(db, 'needboard'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const fetchListings = async () => {
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  };

  const postQuestion = async () => {
    if (!newQ.trim()) return;
    if (!user) { alert('Please login first!'); return; }
    setPosting(true);
    try {
      await addDoc(collection(db, 'needboard'), {
        question: newQ,
        askedBy: 'Anonymous Vitian',
        askedByUid: user.uid,
        askedByPhoto: null,
        replies: [],
        createdAt: serverTimestamp(),
      });
      setNewQ('');
    } catch (e) {}
    setPosting(false);
  };

  const postReply = async (qId) => {
    if (!replyText[qId]?.trim() || !user) return;
    const ref = doc(db, 'needboard', qId);
    await updateDoc(ref, {
      replies: arrayUnion({
        text: replyText[qId],
        by: 'Anonymous Vitian',
        byUid: user.uid,
        byPhoto: null,
        at: new Date().toISOString(),
      })
    });
    setReplyText(prev => ({ ...prev, [qId]: '' }));
    setOpenReply(null);
  };

  const deleteListing = async (e, id) => {
    e.preventDefault();
    if (confirm('Delete this listing?')) {
      await deleteDoc(doc(db, 'listings', id));
      setItems(items.filter(i => i.id !== id));
    }
  };

  const filtered = category === 'All' ? items : items.filter(i => i.studentType === category.replace(/^.+? /, ''));
  const visibleQuestions = showAllQ ? questions : questions.slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '80px' }}>

      {/* NAV */}
      <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>←</button>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c8f135"/><stop offset="100%" stopColor="#ff5c35"/>
              </linearGradient>
            </defs>
            <polygon points="32,4 58,18 58,46 32,60 6,46 6,18" fill="url(#lg)" opacity="0.15" stroke="url(#lg)" strokeWidth="2"/>
            <path d="M20 22 Q32 10 44 22" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <polygon points="44,22 40,16 49,17" fill="#c8f135"/>
            <path d="M44 42 Q32 54 20 42" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" fill="none"/>
            <polygon points="20,42 24,48 15,47" fill="#ff5c35"/>
            <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill="url(#lg)">VL</text>
          </svg>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>VIT<span style={{ color: '#ff5c35' }}>Loop</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isAdmin && <span style={{ background: 'rgba(255,92,53,0.15)', color: '#ff5c35', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(255,92,53,0.3)' }}>👑 Admin</span>}
          <Link href="/sell" style={{ background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', padding: '9px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>+ List Item</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>

        {/* NEED BOARD */}
        <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>🎓</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Ask Seniors — Need Board</h2>
            <span style={{ background: 'rgba(108,99,255,0.25)', color: '#a78bfa', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>LIVE</span>
            <span style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.4)', fontSize: '11px', padding: '3px 10px', borderRadius: '100px', marginLeft: 'auto' }}>🔒 Anonymous</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input value={newQ} onChange={e => setNewQ(e.target.value)}
              placeholder="Ask anything anonymously — seniors will answer! 💬"
              onKeyDown={e => e.key === 'Enter' && postQuestion()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }} />
            <button onClick={postQuestion} disabled={posting}
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '10px', padding: '12px 22px', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Ask 🙋
            </button>
          </div>

          {questions.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '8px' }}>No questions yet. Be the first to ask!</p>
          )}

          {visibleQuestions.map(q => (
            <div key={q.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(108,99,255,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: getColor(q.askedByUid), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>🎓</div>
                <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>Anonymous Vitian</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginLeft: 'auto' }}>
                  {q.createdAt?.toDate?.()?.toLocaleString?.('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''}
                </span>
              </div>

              <p style={{ color: '#e2e8f0', fontSize: '15px', margin: '0 0 12px' }}>{q.question}</p>

              {(q.replies || []).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '10px 12px', marginBottom: '6px', borderLeft: '3px solid #6C63FF' }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: getColor(r.byUid), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px', flexShrink: 0 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#00D4FF', fontSize: '12px', fontWeight: '600' }}>Anonymous Vitian </span>
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{r.text}</span>
                    <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>
                      {r.at ? new Date(r.at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button onClick={() => setOpenReply(openReply === q.id ? null : q.id)}
                  style={{ background: 'transparent', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                  💬 Reply ({(q.replies || []).length})
                </button>
                {(isAdmin || user?.uid === q.askedByUid) && (
                  <button onClick={async () => { if (confirm('Delete?')) await deleteDoc(doc(db, 'needboard', q.id)); }}
                    style={{ background: 'transparent', border: '1px solid rgba(255,92,53,0.3)', color: '#ff5c35', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    🗑 {isAdmin ? 'Admin Delete' : 'Delete'}
                  </button>
                )}
              </div>

              {openReply === q.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input value={replyText[q.id] || ''} onChange={e => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Reply anonymously..."
                    onKeyDown={e => e.key === 'Enter' && postReply(q.id)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => postReply(q.id)}
                    style={{ background: '#6C63FF', border: 'none', borderRadius: '8px', padding: '9px 18px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Send</button>
                </div>
              )}
            </div>
          ))}

          {questions.length > 2 && (
            <button onClick={() => showAllQ ? setShowAllQ(false) : router.push('/chat')}
              style={{ width: '100%', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa', borderRadius: '10px', padding: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }}>
              {showAllQ ? '▲ Show Less' : `👀 See all ${questions.length} questions →`}
            </button>
          )}
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ padding: '10px 20px', borderRadius: '100px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: category === cat ? 'linear-gradient(135deg, #c8f135, #a8d020)' : 'rgba(255,255,255,0.08)', color: category === cat ? '#0d0d0d' : 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: '14px' }}>
              {cat}
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'rgba(255,255,255,0.5)' }}>
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} available
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px' }}>📦</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginBottom: '12px' }}>No listings yet.</p>
            <Link href="/sell" style={{ color: '#c8f135', fontWeight: '700', textDecoration: 'none' }}>Be the first to list something →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {filtered.map(item => (
              <div key={item.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(200,241,53,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <div style={{ height: '170px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative' }}>
                  {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} /> : '📦'}
                  <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: item.type === 'Rent' ? 'rgba(90,158,26,0.9)' : 'rgba(255,92,53,0.9)', color: '#fff', fontWeight: '700' }}>{item.type}</span>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '11px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{item.studentType}</span>
                  {/* Admin delete on image */}
                  {isAdmin && (
                    <button onClick={(e) => deleteListing(e, item.id)}
                      style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(255,92,53,0.9)', border: 'none', borderRadius: '8px', padding: '4px 10px', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                      🗑 Delete
                    </button>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '700', fontSize: '16px', color: '#fff', margin: '0 0 4px' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 4px' }}>📍 {item.hostel}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(108,99,255,0.8)', margin: '0 0 12px' }}>🔒 Anonymous Vitian</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '800', color: '#c8f135', fontSize: '20px' }}>₹{item.price}</span>
                  </div>
                  <Link href={`/chat/${item.id}`}
                    style={{ display: 'block', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', textDecoration: 'none', fontWeight: '700', textAlign: 'center' }}>
                    💬 I'm Interested
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}