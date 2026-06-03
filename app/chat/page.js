'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import BottomNav from '../components/BottomNav';

const COLORS = ['#6C63FF','#00D4FF','#ff5c35','#c8f135','#f59e0b','#ec4899','#10b981'];
const getColor = (uid) => COLORS[(uid?.charCodeAt(0) || 0) % COLORS.length];
const ADMIN_PASSWORD = 'deeplooop';

export default function ChatPage() {
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState('');
  const [posting, setPosting] = useState(false);
  const [openReply, setOpenReply] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [nickname, setNickname] = useState('Anonymous Vitian');
  const [showNickInput, setShowNickInput] = useState(false);
  const [nickDraft, setNickDraft] = useState('');
  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') setIsAdmin(true);
    const saved = localStorage.getItem('vitloop_nickname');
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'needboard'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleSecretTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      if (isAdmin) {
        if (confirm('Exit admin mode?')) { localStorage.removeItem('isAdmin'); setIsAdmin(false); }
        return;
      }
      const pwd = prompt('🔐 Enter admin password:');
      if (pwd === ADMIN_PASSWORD) {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        alert('✅ Admin mode enabled');
      } else if (pwd !== null) alert('❌ Wrong password');
    }
  };

  const saveNickname = () => {
    if (!nickDraft.trim()) return;
    const n = nickDraft.trim();
    localStorage.setItem('vitloop_nickname', n);
    setNickname(n);
    setShowNickInput(false);
    setNickDraft('');
  };

  const getDeviceId = () => {
    let id = localStorage.getItem('vitloop_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substr(2, 12);
      localStorage.setItem('vitloop_device_id', id);
    }
    return id;
  };

  const postQuestion = async () => {
    if (!newQ.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'needboard'), {
        question: newQ,
        askedBy: nickname,
        askedByUid: getDeviceId(),
        askedByPhoto: null,
        replies: [],
        createdAt: serverTimestamp(),
      });
      setNewQ('');
    } catch (e) {}
    setPosting(false);
  };

  const postReply = async (qId) => {
    if (!replyText[qId]?.trim()) return;
    const ref = doc(db, 'needboard', qId);
    await updateDoc(ref, {
      replies: arrayUnion({
        text: replyText[qId],
        by: nickname,
        byUid: getDeviceId(),
        byPhoto: null,
        at: new Date().toISOString(),
      })
    });
    setReplyText(prev => ({ ...prev, [qId]: '' }));
    setOpenReply(null);
  };

  const deleteQuestion = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this question?')) return;
    await deleteDoc(doc(db, 'needboard', id));
  };

  const toggleReplies = (qId) => {
    setExpandedReplies(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '80px' }}>

      <nav style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer', padding: '0 4px' }}>←</button>
        <span onClick={handleSecretTap} style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600', userSelect: 'none', cursor: 'default' }}>💬 Help Board</span>
        {isAdmin && <span style={{ background: 'rgba(255,92,53,0.2)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.4)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', padding: '2px 8px' }}>ADMIN</span>}

        {/* Nickname button */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => { setShowNickInput(!showNickInput); setNickDraft(nickname === 'Anonymous Vitian' ? '' : nickname); }}
            style={{
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '20px',
              padding: '5px 12px',
              color: '#a78bfa',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
            🎭 {nickname === 'Anonymous Vitian' ? 'Set Nickname' : nickname}
          </button>
        </div>
      </nav>

      {/* Nickname input dropdown */}
      {showNickInput && (
        <div style={{
          position: 'sticky',
          top: '57px',
          zIndex: 99,
          background: 'rgba(7,7,15,0.98)',
          borderBottom: '1px solid rgba(108,99,255,0.2)',
          padding: '12px 20px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '16px' }}>🎭</span>
          <input
            value={nickDraft}
            onChange={e => setNickDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveNickname()}
            placeholder="Enter your nickname (e.g. Jupiter, Naruto...)"
            style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
            autoFocus
          />
          <button onClick={saveNickname}
            style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
            Save
          </button>
          <button onClick={() => setShowNickInput(false)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Ask box */}
        <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '18px' }}>🎓</span>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Ask Seniors — Need Board</h2>
            <span style={{ background: 'rgba(108,99,255,0.25)', color: '#a78bfa', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px' }}>LIVE</span>
            <span style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', padding: '2px 8px', borderRadius: '100px', marginLeft: 'auto' }}>🔒 Anonymous</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={newQ} onChange={e => setNewQ(e.target.value)}
              placeholder="Ask anything anonymously 💬"
              onKeyDown={e => e.key === 'Enter' && postQuestion()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontSize: '14px', outline: 'none' }} />
            <button onClick={postQuestion} disabled={posting}
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '10px', padding: '11px 18px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(108,99,255,0.3)' }}>
              Ask 🙋
            </button>
          </div>
        </div>

        {questions.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>No questions yet. Be the first to ask!</p>
        )}

        {questions.map(q => {
          const replies = q.replies || [];
          const isExpanded = expandedReplies[q.id];
          const visibleReplies = isExpanded ? replies : replies.slice(0, 1);
          const hiddenCount = replies.length - 1;

          return (
            <div key={q.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '14px', marginBottom: '10px', border: '1px solid rgba(108,99,255,0.12)' }}>

              {/* Question header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: getColor(q.askedByUid), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>🎓</div>
                <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600' }}>{q.askedBy || 'Anonymous Vitian'}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', marginLeft: 'auto' }}>
                  {q.createdAt?.toDate?.()?.toLocaleString?.('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) || ''}
                </span>
              </div>

              <p style={{ color: '#e2e8f0', fontSize: '14px', margin: '0 0 10px', lineHeight: '1.5' }}>{q.question}</p>

              {/* Replies */}
              {visibleReplies.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '8px 10px', marginBottom: '6px', borderLeft: '3px solid #6C63FF' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: getColor(r.byUid), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', flexShrink: 0 }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#00D4FF', fontSize: '11px', fontWeight: '600' }}>{r.by || 'Anonymous Vitian'} </span>
                    <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{r.text}</span>
                    <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                      {r.at ? new Date(r.at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </div>
                </div>
              ))}

              {/* Show more / less replies */}
              {replies.length > 1 && (
                <button onClick={() => toggleReplies(q.id)}
                  style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', padding: '5px 12px', color: '#a78bfa', fontSize: '11px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isExpanded ? '▲ Show less' : `▼ Show ${hiddenCount} more ${hiddenCount === 1 ? 'reply' : 'replies'}`}
                </button>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setOpenReply(openReply === q.id ? null : q.id)}
                  style={{ background: 'transparent', border: '1px solid rgba(108,99,255,0.3)', color: '#a78bfa', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                  💬 Reply ({replies.length})
                </button>
                {isAdmin && (
                  <button onClick={(e) => deleteQuestion(e, q.id)}
                    style={{ background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.25)', borderRadius: '8px', padding: '5px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Reply input */}
              {openReply === q.id && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <input value={replyText[q.id] || ''} onChange={e => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder={`Reply as ${nickname}...`}
                    onKeyDown={e => e.key === 'Enter' && postReply(q.id)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                  <button onClick={() => postReply(q.id)}
                    style={{ background: '#6C63FF', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>Send</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}