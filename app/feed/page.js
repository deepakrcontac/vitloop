'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase';
import {
  collection, getDocs, addDoc, deleteDoc, doc,
  orderBy, query, serverTimestamp, updateDoc, arrayUnion, onSnapshot
} from 'firebase/firestore';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['All', '🏠 Hostellers', '🚌 Day Scholars'];

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [newQ, setNewQ] = useState('');
  const [posting, setPosting] = useState(false);
  const [openReply, setOpenReply] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [chatTarget, setChatTarget] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    fetchListings();
    // Realtime needboard
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
        askedBy: user.displayName || user.email?.split('@')[0],
        askedByUid: user.uid,
        askedByPhoto: user.photoURL || null,
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
        by: user.displayName || user.email?.split('@')[0],
        byUid: user.uid,
        byPhoto: user.photoURL || null,
        at: new Date().toISOString(),
      })
    });
    setReplyText(prev => ({ ...prev, [qId]: '' }));
    setOpenReply(null);
  };

  // Chat logic
  const openChat = (targetUid, targetName, targetPhoto) => {
    setChatTarget({ uid: targetUid, name: targetName, photo: targetPhoto });
    const chatId = [user?.uid, targetUid].sort().join('_');
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    onSnapshot(q, snap => {
      setChatMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  };

  const sendChat = async () => {
    if (!chatText.trim() || !user || !chatTarget) return;
    const chatId = [user.uid, chatTarget.uid].sort().join('_');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: chatText,
      from: user.uid,
      fromName: user.displayName || user.email?.split('@')[0],
      createdAt: serverTimestamp(),
    });
    setChatText('');
  };

  const filtered = category === 'All' ? items : items.filter(i => i.studentType === category.replace(/^.+? /, ''));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '80px' }}>

      {/* NAV */}
      <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#c8f135"/>
                <stop offset="100%" stopColor="#ff5c35"/>
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
        <Link href="/sell" style={{ background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', padding: '9px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>+ List Item</Link>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>

        {/* ===== NEED BOARD Q&A ===== */}
        <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>🎓</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Ask Seniors — Need Board</h2>
            <span style={{ background: 'rgba(108,99,255,0.25)', color: '#a78bfa', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>LIVE</span>
          </div>

          {/* Ask input */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input value={newQ} onChange={e => setNewQ(e.target.value)}
              placeholder="Ask anything — seniors will answer you! 💬"
              onKeyDown={e => e.key === 'Enter' && postQuestion()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' }} />
            <button onClick={postQuestion} disabled={posting}
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '10px', padding: '12px 22px', color: '#fff', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Ask 🙋
            </button>
          </div>

          {/* Questions list */}
          {questions.length === 0 && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '8px' }}>No questions yet. Be the first to ask!</p>
          )}
          {questions.map(q => (
            <div key={q.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '16px', marginBottom: '12px', border: '1px solid rgba(108,99,255,0.15)' }}>
              {/* Question header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {q.askedByPhoto
                  ? <img src={q.askedByPhoto} onClick={() => q.askedByUid !== user?.uid && openChat(q.askedByUid, q.askedBy, q.askedByPhoto)}
                      style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', border: '2px solid #6C63FF' }} />
                  : <div onClick={() => q.askedByUid !== user?.uid && openChat(q.askedByUid, q.askedBy, null)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                      {(q.askedBy || 'U')[0].toUpperCase()}
                    </div>
                }
                <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>{q.askedBy}</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginLeft: 'auto' }}>
                  {q.createdAt?.toDate?.()?.toLocaleDateString?.() || ''}
                </span>
              </div>

              <p style={{ color: '#e2e8f0', fontSize: '15px', margin: '0 0 12px' }}>{q.question}</p>

              {/* Replies */}
              {(q.replies || []).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '10px 12px', marginBottom: '6px', borderLeft: '3px solid #6C63FF' }}>
                  <div onClick={() => r.byUid !== user?.uid && openChat(r.byUid, r.by, r.byPhoto)}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#00D4FF,#6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>
                    {r.byPhoto ? <img src={r.byPhoto} style={{ width: 26, height: 26, borderRadius: '50%' }} /> : (r.by || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <span style={{ color: '#00D4FF', fontSize: '12px', fontWeight: '600' }}>{r.by} </span>
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{r.text}</span>
                  </div>
                </div>
              ))}

              {/* Reply button */}
              <button onClick={() => setOpenReply(openReply === q.id ? null : q.id)}
                style={{ background: 'transparent', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', marginTop: '4px', fontWeight: '600' }}>
                💬 Reply ({(q.replies || []).length})
              </button>

              {openReply === q.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input value={replyText[q.id] || ''} onChange={e => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="Write your answer..."
                    onKeyDown={e => e.key === 'Enter' && postReply(q.id)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '9px 12px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => postReply(q.id)}
                    style={{ background: '#6C63FF', border: 'none', borderRadius: '8px', padding: '9px 18px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Send</button>
                </div>
              )}
            </div>
          ))}
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
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '700', fontSize: '16px', color: '#fff', margin: '0 0 4px' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '0 0 12px' }}>📍 {item.hostel}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '800', color: '#c8f135', fontSize: '20px' }}>₹{item.price}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a href={"https://wa.me/91" + item.phone} target="_blank"
                      style={{ flex: 1, background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '8px', padding: '9px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', textAlign: 'center' }}>
                      💬 WhatsApp
                    </a>
                    <a href={"tel:" + item.phone}
                      style={{ flex: 1, background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '8px', padding: '9px', fontSize: '13px', textDecoration: 'none', fontWeight: '600', textAlign: 'center' }}>
                      📞 Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== CHAT POPUP ===== */}
      {chatTarget && (
        <div style={{ position: 'fixed', bottom: 90, right: 20, width: 310, background: '#0d0d1a', borderRadius: '18px', border: '1px solid rgba(108,99,255,0.4)', boxShadow: '0 8px 40px rgba(108,99,255,0.25)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '12px' }}>
                {chatTarget.photo ? <img src={chatTarget.photo} style={{ width: 28, height: 28, borderRadius: '50%' }} /> : chatTarget.name[0]}
              </div>
              <span style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '14px' }}>{chatTarget.name}</span>
            </div>
            <button onClick={() => setChatTarget(null)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ height: 240, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatMessages.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'center', marginTop: '80px' }}>Start the conversation 👋</p>
            )}
            {chatMessages.map(m => (
              <div key={m.id} style={{ alignSelf: m.from === user?.uid ? 'flex-end' : 'flex-start', background: m.from === user?.uid ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '12px', padding: '8px 12px', maxWidth: '80%', fontSize: '13px' }}>
                {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <input value={chatText} onChange={e => setChatText(e.target.value)}
              placeholder="Type a message..." onKeyDown={e => e.key === 'Enter' && sendChat()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px', outline: 'none' }} />
            <button onClick={sendChat} style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>→</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}