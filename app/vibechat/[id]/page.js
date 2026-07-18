'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { useUid } from '../../../lib/auth';
import { pushNotification } from '../../../lib/notifications';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import AvatarIcon from '../../components/AvatarIcon';

export default function VibeChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const uid = useUid();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [otherProfile, setOtherProfile] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!uid || !id) return;
    (async () => {
      const chatSnap = await getDoc(doc(db, 'vibeChats', id));
      if (chatSnap.exists()) {
        const otherUid = chatSnap.data().participants.find(p => p !== uid);
        if (otherUid) {
          const pSnap = await getDoc(doc(db, 'profiles', otherUid));
          if (pSnap.exists()) setOtherProfile({ id: otherUid, ...pSnap.data() });
        }
      }
    })();
  }, [uid, id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, `vibeChats/${id}/messages`), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsub();
  }, [id]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !uid) return;
    await addDoc(collection(db, `vibeChats/${id}/messages`), {
      text: newMsg, senderId: uid, createdAt: serverTimestamp(),
    });
    if (otherProfile) {
      pushNotification({
        userId: otherProfile.id,
        type: 'vibe_message',
        title: 'New message on Vibe Match',
        body: newMsg,
        link: `/vibechat/${id}`,
        fromUid: uid,
      });
    }
    setNewMsg('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AvatarIcon gender={otherProfile?.gender} size={28} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: '800', fontSize: '15px' }}>{otherProfile?.nickname || 'Vibe Match'}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#a78bfa' }}>🔒 Anonymous · {otherProfile?.bio ? otherProfile.bio.slice(0, 40) : 'Say hi!'}</p>
        </div>
      </nav>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '32px' }}>🤝</p>
            <p>You matched! Say hi 👋</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === uid;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
              {!isMe && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AvatarIcon gender={otherProfile?.gender} size={22} />
                </div>
              )}
              <div style={{ maxWidth: '70%' }}>
                <div style={{ background: isMe ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'rgba(255,255,255,0.08)', color: '#fff', padding: '10px 14px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: '14px', border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ margin: 0 }}>{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

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
