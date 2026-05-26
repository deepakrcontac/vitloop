'use client';
import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';

const COLORS = ['#6C63FF','#00D4FF','#ff5c35','#c8f135','#f59e0b','#ec4899','#10b981'];
const getColor = (uid) => COLORS[(uid?.charCodeAt(0) || 0) % COLORS.length];

export default function ItemChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [item, setItem] = useState(null);
  const bottomRef = useRef(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchItem = async () => {
      const snap = await getDoc(doc(db, 'listings', id));
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    };
    fetchItem();
    const q = query(collection(db, `chats/${id}/messages`), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [id]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return;
    await addDoc(collection(db, `chats/${id}/messages`), {
      text: newMsg,
      senderId: user.uid,
      senderName: 'Anonymous Vitian',
      createdAt: serverTimestamp(),
    });
    setNewMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💬</div>
        <div>
          <p style={{ margin: 0, fontWeight: '800', fontSize: '15px' }}>{item?.title || 'Chat'}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#a78bfa' }}>🔒 Anonymous · No identities shared</p>
        </div>
      </nav>

      {/* ITEM INFO */}
      {item && (
        <div style={{ margin: '16px 20px', background: 'linear-gradient(135deg, rgba(200,241,53,0.08), rgba(255,92,53,0.08))', border: '1px solid rgba(200,241,53,0.15)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>{item.title}</p>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📍 {item.hostel}</p>
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#a78bfa' }}>🔒 Seller is Anonymous Vitian</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: '800', color: '#c8f135', fontSize: '18px' }}>₹{item.price}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', padding: '2px 8px', borderRadius: '100px', background: item.type === 'Rent' ? 'rgba(90,158,26,0.3)' : 'rgba(255,92,53,0.3)', color: item.type === 'Rent' ? '#7ecb3e' : '#ff5c35', display: 'inline-block', fontWeight: '700' }}>{item.type}</p>
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '32px' }}>🔒</p>
            <p>Chat is fully anonymous!</p>
            <p style={{ fontSize: '12px' }}>Start the conversation — no identities shared</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
              {!isMe && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: getColor(msg.senderId), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>🎓</div>
              )}
              <div style={{ maxWidth: '70%' }}>
                {!isMe && <p style={{ margin: '0 0 3px 4px', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>Anonymous Vitian</p>}
                <div style={{ background: isMe ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'rgba(255,255,255,0.08)', color: '#fff', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '14px', border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,7,15,0.95)', display: 'flex', gap: '10px' }}>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Message anonymously..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
        <button onClick={sendMessage}
          style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
          Send →
        </button>
      </div>
    </div>
  );
}