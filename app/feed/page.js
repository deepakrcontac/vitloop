'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import {
  collection, getDocs, deleteDoc, doc,
  orderBy, query
} from 'firebase/firestore';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';

const CATEGORIES = ['All', '🏠 Hostellers', '🚌 Day Scholars'];
const ADMIN_EMAILS = ['deepak.2024a@vitstudent.ac.in', 'deepak.rcontact@gmail.com'];

export default function FeedPage() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const router = useRouter();
  const isAdmin = ADMIN_EMAILS.includes(user?.email);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  };

  const deleteListing = async (e, id) => {
    e.preventDefault();
    if (confirm('Delete this listing?')) {
      await deleteDoc(doc(db, 'listings', id));
      setItems(items.filter(i => i.id !== id));
    }
  };

  const filtered = category === 'All' ? items : items.filter(i => i.studentType === category.replace(/^.+? /, ''));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '90px' }}>

      {/* NAV */}
      <nav style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,15,0.97)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer', padding: '0 4px' }}>←</button>
          <span style={{ fontSize: '18px', fontWeight: '900' }}>🏪 Marketplace</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && <span style={{ background: 'rgba(255,92,53,0.15)', color: '#ff5c35', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(255,92,53,0.3)' }}>👑 Admin</span>}
          <Link href="/sell" style={{
            background: 'linear-gradient(135deg, #c8f135, #a8d020)',
            color: '#0d0d0d',
            padding: '8px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '13px',
            boxShadow: '0 4px 14px rgba(200,241,53,0.3)',
          }}>+ List Item</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px' }}>

        {/* ANONYMOUS BADGE */}
        <div style={{
          background: 'rgba(108,99,255,0.1)',
          border: '1px solid rgba(108,99,255,0.2)',
          borderRadius: '12px',
          padding: '10px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>🔒</span>
          <p style={{ margin: 0, fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>All listings are 100% anonymous — no phone numbers, no identities</p>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                border: category === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                background: category === cat ? 'linear-gradient(135deg, #c8f135, #a8d020)' : 'rgba(255,255,255,0.06)',
                color: category === cat ? '#0d0d0d' : 'rgba(255,255,255,0.6)',
                fontWeight: '700',
                fontSize: '13px',
                boxShadow: category === cat ? '0 4px 14px rgba(200,241,53,0.25)' : 'none',
                transform: category === cat ? 'translateY(-1px)' : 'none',
                transition: 'all 0.2s',
              }}>
              {cat}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '16px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {filtered.length} listing{filtered.length !== 1 ? 's' : ''} available
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '32px' }}>⏳</p>
            <p>Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ fontSize: '48px' }}>📦</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px', marginBottom: '16px' }}>No listings yet.</p>
            <Link href="/sell" style={{
              background: 'linear-gradient(135deg, #c8f135, #a8d020)',
              color: '#0d0d0d',
              padding: '10px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '14px',
            }}>Be the first to list something →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {filtered.map(item => (
              <div key={item.id} style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'rgba(200,241,53,0.3)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
              }}>

                {/* Image */}
                <div style={{ height: '130px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', position: 'relative' }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} />
                    : '📦'
                  }
                  <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', padding: '3px 8px', borderRadius: '100px', background: item.type === 'Rent' ? 'rgba(90,158,26,0.9)' : 'rgba(255,92,53,0.9)', color: '#fff', fontWeight: '700' }}>{item.type}</span>
                  <span style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>{item.studentType}</span>
                  {isAdmin && (
                    <button onClick={(e) => deleteListing(e, item.id)}
                      style={{ position: 'absolute', bottom: '6px', right: '6px', background: 'rgba(255,92,53,0.9)', border: 'none', borderRadius: '6px', padding: '3px 8px', color: '#fff', fontSize: '10px', fontWeight: '700', cursor: 'pointer' }}>
                      🗑
                    </button>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '12px' }}>
                  <p style={{ fontWeight: '700', fontSize: '13px', color: '#fff', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: '0 0 8px' }}>📍 {item.hostel}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '800', color: '#c8f135', fontSize: '16px' }}>₹{item.price}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(108,99,255,0.8)', fontWeight: '600' }}>🔒 Anon</span>
                  </div>
                  <Link href={`/chat/${item.id}`} style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(0,212,255,0.2))',
                    border: '1px solid rgba(108,99,255,0.4)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '12px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    textAlign: 'center',
                    boxShadow: '0 2px 10px rgba(108,99,255,0.2)',
                  }}>
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