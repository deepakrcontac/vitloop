'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['All', '🏠 Hostellers', '🚌 Day Scholars'];

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [newRequest, setNewRequest] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      const rq = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
      const rsnap = await getDocs(rq);
      setRequests(rsnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  };

  const postRequest = async () => {
    if (!newRequest.trim() || !newPhone.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'requests'), {
        text: newRequest,
        phone: newPhone,
        userEmail: auth.currentUser?.email || 'anonymous',
        createdAt: serverTimestamp(),
      });
      setNewRequest('');
      setNewPhone('');
      fetchAll();
    } catch (e) {}
    setPosting(false);
  };

  const deleteRequest = async (id, email) => {
    if (auth.currentUser?.email !== email) return;
    await deleteDoc(doc(db, 'requests', id));
    setRequests(requests.filter(r => r.id !== id));
  };

  const filtered = category === 'All' ? items : items.filter(i => i.studentType === category.replace(/^.+? /, ''));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '80px' }}>

      <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,13,0.9)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c8f135, #ff5c35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#0d0d0d' }}>V</div>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>VIT<span style={{ color: '#ff5c35' }}>Loop</span></span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/sell" style={{ background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', padding: '9px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>+ List Item</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>

        {/* NEED BOARD */}
        <div style={{ background: 'linear-gradient(135deg, rgba(200,241,53,0.08), rgba(255,92,53,0.08))', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>📢</span>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Need Board</h2>
            <span style={{ background: 'rgba(200,241,53,0.2)', color: '#c8f135', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px' }}>LIVE</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input value={newRequest} onChange={e => setNewRequest(e.target.value)}
              placeholder="What do you need? e.g. Need calculator for exam 🧮"
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input value={newPhone} onChange={e => setNewPhone(e.target.value)}
              placeholder="Your WhatsApp number e.g. 9876543210"
              type="tel"
              style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={postRequest} disabled={posting}
              style={{ background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Post 📣
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requests.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textAlign: 'center', padding: '8px' }}>No requests yet. Post what you need!</p>
            )}
            {requests.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{r.text}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>📞 {r.phone}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={"https://wa.me/91" + r.phone} target="_blank"
                    style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', textDecoration: 'none', fontWeight: '600' }}>
                    💬 WhatsApp
                  </a>
                  {auth.currentUser?.email === r.userEmail && (
                    <button onClick={() => deleteRequest(r.id, r.userEmail)}
                      style={{ background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '8px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                      Got it ✓
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
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
              <div key={item.id} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(200,241,53,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <div style={{ height: '170px', background: 'linear-gradient(135deg, rgba(200,241,53,0.08), rgba(255,92,53,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', position: 'relative' }}>
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
      <BottomNav />
    </div>
  );
}