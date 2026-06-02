'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImage } from '../../lib/cloudinary';
import { useRouter } from 'next/navigation';

export default function SellPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [studentType, setStudentType] = useState('Hostellers');
  const [type, setType] = useState('Sale');
  const [hostel, setHostel] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title || !price || !hostel) { setError('Please fill title, price and location!'); return; }
    setLoading(true);
    try {
      let imageUrl = '';
      if (image) imageUrl = await uploadImage(image);
      await addDoc(collection(db, 'listings'), {
        title, price: Number(price), studentType, type,
        hostel, description, imageUrl,
        createdAt: serverTimestamp(),
        userId: 'anonymous',
        userEmail: 'anonymous',
      });
      router.push('/feed');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff' }}>
      <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,13,13,0.9)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c8f135, #ff5c35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#0d0d0d' }}>V</div>
          <span style={{ fontSize: '20px', fontWeight: '900' }}>VIT<span style={{ color: '#ff5c35' }}>Loop</span></span>
        </div>
        <a href="/feed" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none' }}>← Back</a>
      </nav>

      <div style={{ maxWidth: '540px', margin: '40px auto', padding: '0 20px 60px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '6px' }}>List an Item</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '28px' }}>🔒 You are completely anonymous — no phone number needed</p>

        {error && <p style={{ color: '#ff5c35', fontSize: '13px', marginBottom: '16px', background: 'rgba(255,92,53,0.1)', padding: '12px 16px', borderRadius: '10px' }}>{error}</p>}

        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Item Title *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Casio fx-991 Calculator"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '18px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.07)', color: '#fff', boxSizing: 'border-box' }} />

          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Price (₹) *</label>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 200" type="number"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '18px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.07)', color: '#fff', boxSizing: 'border-box' }} />

          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Student Type *</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            {['Hostellers', 'Day Scholars'].map(t => (
              <button key={t} onClick={() => setStudentType(t)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid', borderColor: studentType === t ? '#c8f135' : 'rgba(255,255,255,0.12)', background: studentType === t ? 'rgba(200,241,53,0.12)' : 'transparent', color: studentType === t ? '#c8f135' : 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t === 'Hostellers' ? '🏠 Hostellers' : '🚌 Day Scholars'}
              </button>
            ))}
          </div>

          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Listing Type *</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            {['Sale', 'Rent'].map(t => (
              <button key={t} onClick={() => setType(t)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid', borderColor: type === t ? '#ff5c35' : 'rgba(255,255,255,0.12)', background: type === t ? 'rgba(255,92,53,0.12)' : 'transparent', color: type === t ? '#ff5c35' : 'rgba(255,255,255,0.4)', fontWeight: '700', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t === 'Sale' ? '🏷️ Sale' : '🔄 Rent'}
              </button>
            ))}
          </div>

          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Meetup Location *</label>
          <input value={hostel} onChange={e => setHostel(e.target.value)} placeholder="e.g. MB Food Court, Library Entrance"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '18px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.07)', color: '#fff', boxSizing: 'border-box' }} />

          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your item — condition, age, any details..." rows={3}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '18px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.07)', color: '#fff', resize: 'vertical', boxSizing: 'border-box' }} />

          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Photo</label>
          <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])}
            style={{ width: '100%', marginBottom: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }} />

          <div style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🔒</span>
            <p style={{ margin: 0, fontSize: '12px', color: '#a78bfa' }}>Your identity is completely anonymous. Buyers will contact you through VITLoop chat only.</p>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '15px', background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #c8f135, #a8d020)', color: loading ? 'rgba(255,255,255,0.3)' : '#0d0d0d', borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Uploading...' : 'Post Listing 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}