'use client';
import { useEffect, useState, useRef } from 'react';
import { db, auth } from '../../../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [item, setItem] = useState(null);
  const bottomRef = useRef(null);

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
    if (!newMsg.trim()) return;
    await addDoc(collection(db, `chats/${id}/messages`), {
      text: newMsg,
      senderEmail: auth.currentUser?.email || 'anonymous',
      createdAt: serverTimestamp(),
    });
    setNewMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/feed" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '20px' }}>←</Link>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c8f135, #ff5c35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#0d0d0d' }}>V</div>
        <div>
          <p style={{ margin: 0, fontWeight: '800', fontSize: '15px' }}>{item?.title || 'Chat'}</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>with {item?.userEmail}</p>
        </div>
      </nav>

      {/* ITEM INFO */}
      {item && (
        <div style={{ margin: '16px 20px', background: 'linear-gradient(135deg, rgba(200,241,53,0.08), rgba(255,92,53,0.08))', border: '1px solid rgba(200,241,53,0.15)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>{item.title}</p>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📍 {item.hostel} · 📞 {item.phone}</p>
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
            <p style={{ fontSize: '32px' }}>💬</p>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderEmail === auth.currentUser?.email;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '70%', background: isMe ? 'linear-gradient(135deg, #c8f135, #a8d020)' : 'rgba(255,255,255,0.08)', color: isMe ? '#0d0d0d' : '#fff', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '14px', border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ margin: 0 }}>{msg.text}</p>
                <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.6 }}>{msg.senderEmail}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,13,13,0.9)', display: 'flex', gap: '10px' }}>
        <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
        <button onClick={sendMessage}
          style={{ background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', border: 'none', borderRadius: '12px', padding: '12px 20px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
          Send →
        </button>
      </div>
    </div>
  );
}