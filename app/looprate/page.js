'use client';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import BottomNav from '../components/BottomNav';
import { uploadImage } from '../../lib/cloudinary';

const ADMIN_PASSWORD = 'vitloop2024'; // Change this to your secret password

export default function LoopRatePage() {
  const [faculties, setFaculties] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', school: '', subject: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  // Check localStorage for admin status on mount
  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') setIsAdmin(true);
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const q = query(collection(db, 'faculties'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setFaculties(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
    setLoading(false);
  };

  // Secret 5-tap handler
  const handleSecretTap = () => {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);

    if (tapCount.current >= 5) {
      tapCount.current = 0;
      if (isAdmin) {
        if (confirm('Exit admin mode?')) {
          localStorage.removeItem('isAdmin');
          setIsAdmin(false);
        }
        return;
      }
      const pwd = prompt('🔐 Enter admin password:');
      if (pwd === ADMIN_PASSWORD) {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        alert('✅ Admin mode enabled');
      } else if (pwd !== null) {
        alert('❌ Wrong password');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const addFaculty = async () => {
    if (!newFaculty.name || !newFaculty.school) return;
    setAdding(true);
    try {
      let imageUrl = '';
      if (image) imageUrl = await uploadImage(image);
      await addDoc(collection(db, 'faculties'), {
        ...newFaculty, imageUrl,
        greenFlags: 0, redFlags: 0, reviewCount: 0,
        createdAt: serverTimestamp(),
        addedBy: 'anonymous', // auth removed; no email tracking
      });
      setNewFaculty({ name: '', school: '', subject: '' });
      setImage(null); setPreview(null); setShowAdd(false);
      fetchFaculties();
    } catch (e) {}
    setAdding(false);
  };

  const deleteFaculty = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this faculty?')) return;
    await deleteDoc(doc(db, 'faculties', id));
    setFaculties(faculties.filter(f => f.id !== id));
  };

  const shareWhatsApp = (e, faculty) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://vitloop.vercel.app/looprate/${faculty.id}`;
    const msg = `⭐ Rate ${faculty.name} on VITLoop Faculty Review!\n${faculty.school}\n\nVote & see what others think 👇\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyLink = (e, faculty) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://vitloop.vercel.app/looprate/${faculty.id}`;
    navigator.clipboard.writeText(url);
    setCopied(faculty.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = faculties.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.school?.toLowerCase().includes(search.toLowerCase()) ||
    f.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const getScore = (f) => {
    const total = (f.greenFlags || 0) + (f.redFlags || 0);
    if (total === 0) return 0;
    return Math.round(((f.greenFlags || 0) / total) * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return '#4ade80';
    if (score >= 40) return '#facc15';
    return '#f87171';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '80px' }}>

      <nav style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)' }}>
        <div>
          {/* 5-tap secret trigger on the heading */}
          <h1
            onClick={handleSecretTap}
            style={{ margin: 0, fontSize: '20px', fontWeight: '900', userSelect: 'none', cursor: 'default' }}
          >
            Faculty <span style={{ color: '#c8f135' }}>Review</span> ⭐
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Rate your faculty · Help juniors choose wisely</p>
            {isAdmin && (
              <span style={{ background: 'rgba(255,92,53,0.2)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.4)', borderRadius: '6px', fontSize: '10px', fontWeight: '700', padding: '2px 8px' }}>
                ADMIN
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', border: 'none', borderRadius: '10px', padding: '9px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
          + Add Faculty
        </button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

        {/* ADD FACULTY FORM */}
        {showAdd && (
          <div style={{ background: 'linear-gradient(135deg, rgba(200,241,53,0.08), rgba(255,92,53,0.08))', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800' }}>Add New Faculty</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', border: '2px dashed rgba(255,255,255,0.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {preview ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" /> : <span style={{ fontSize: '28px' }}>🎓</span>}
              </div>
              <div>
                <label style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  📸 Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </label>
                <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Optional — faculty photo</p>
              </div>
            </div>
            <input value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })}
              placeholder="Faculty Name *"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input value={newFaculty.school} onChange={e => setNewFaculty({ ...newFaculty, school: e.target.value })}
              placeholder="School (e.g. SCOPE, SENSE) *"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', marginBottom: '10px', boxSizing: 'border-box' }} />
            <input value={newFaculty.subject} onChange={e => setNewFaculty({ ...newFaculty, subject: e.target.value })}
              placeholder="Subject (e.g. Data Structures)"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={addFaculty} disabled={adding}
                style={{ flex: 1, padding: '11px', background: adding ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #c8f135, #a8d020)', color: adding ? 'rgba(255,255,255,0.3)' : '#0d0d0d', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: adding ? 'not-allowed' : 'pointer' }}>
                {adding ? 'Uploading...' : 'Add Faculty 🎓'}
              </button>
              <button onClick={() => { setShowAdd(false); setPreview(null); setImage(null); }}
                style={{ padding: '11px 20px', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search faculty name, school or subject..."
            style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#c8f135' }}>{faculties.length}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Faculties</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#4ade80' }}>{faculties.reduce((a, f) => a + (f.greenFlags || 0), 0)}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>🟢 Green Flags</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#f87171' }}>{faculties.reduce((a, f) => a + (f.redFlags || 0), 0)}</p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>🔴 Red Flags</p>
          </div>
        </div>

        {/* FACULTY LIST */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>Loading faculties...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
            <p style={{ fontSize: '44px', margin: '0 0 12px' }}>🔍</p>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: '800', color: '#fff' }}>
              "{search}" not found!
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6' }}>
              Be the first to add this faculty!<br/>
              Add them and share with classmates to start getting votes.
            </p>
            <button onClick={() => setShowAdd(true)}
              style={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '12px', padding: '13px 28px', color: '#fff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(108,99,255,0.4)', marginBottom: '16px', display: 'block', width: '100%' }}>
              ➕ Add "{search}" as Faculty
            </button>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)' }}>📢 After adding, share this link:</p>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>vitloop.vercel.app/looprate</p>
              <button onClick={() => {
                const msg = `⭐ Rate ${search} on VITLoop!\n\nHelp your classmates know the truth about this faculty 👇\n\nvitloop.vercel.app/looprate\n\n100% Anonymous 🔒`;
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
              }}
                style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: '10px', padding: '10px 20px', color: '#25d366', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
                📲 Share on WhatsApp to get votes
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(faculty => {
              const score = getScore(faculty);
              const scoreColor = getScoreColor(score);
              const total = (faculty.greenFlags || 0) + (faculty.redFlags || 0);
              return (
                <Link key={faculty.id} href={"/looprate/" + faculty.id} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,241,53,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                          {faculty.imageUrl ? <img src={faculty.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={faculty.name} /> : '🎓'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '800', fontSize: '16px', color: '#fff' }}>{faculty.name}</p>
                          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{faculty.school}</p>
                          {faculty.subject && <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{faculty.subject}</p>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `3px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                          <span style={{ fontSize: '13px', fontWeight: '900', color: scoreColor }}>{total === 0 ? '?' : score + '%'}</span>
                        </div>
                        {/* Admin-only delete button */}
                        {isAdmin && (
                          <button onClick={(e) => deleteFaculty(e, faculty.id)}
                            style={{ background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', padding: '6px 12px' }}>
                        <span>🟢</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80' }}>{faculty.greenFlags || 0} Green</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '6px 12px' }}>
                        <span>🔴</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#f87171' }}>{faculty.redFlags || 0} Red</span>
                      </div>

                      <button onClick={(e) => shareWhatsApp(e, faculty)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '8px', padding: '6px 12px', color: '#25d366', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        <span>📲</span> Share
                      </button>
                      <button onClick={(e) => copyLink(e, faculty)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: copied === faculty.id ? 'rgba(200,241,53,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${copied === faculty.id ? 'rgba(200,241,53,0.4)' : 'rgba(255,255,255,0.12)'}`, borderRadius: '8px', padding: '6px 12px', color: copied === faculty.id ? '#c8f135' : 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        <span>{copied === faculty.id ? '✅' : '🔗'}</span> {copied === faculty.id ? 'Copied!' : 'Copy Link'}
                      </button>

                      <div style={{ marginLeft: 'auto' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{total} votes · tap to review →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
