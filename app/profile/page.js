'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc, orderBy } from 'firebase/firestore';
import { updatePassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', phone: '', department: '', year: '', hostel: '' });
  const [myListings, setMyListings] = useState([]);
  const [editing, setEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) setProfile(snap.data());
        const q = query(collection(db, 'listings'), where('userId', '==', u.uid));
        const lsnap = await getDocs(q);
        setMyListings(lsnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {}
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { ...profile, email: user.email });
      setSuccess('Profile saved!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {}
    setSaving(false);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setSuccess('Password must be at least 6 characters!'); return; }
    try {
      await updatePassword(user, newPassword);
      setSuccess('Password changed successfully!');
      setNewPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setSuccess('Please login again to change password.');
    }
  };

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await deleteDoc(doc(db, 'listings', id));
    setMyListings(myListings.filter(l => l.id !== id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
      Loading...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '100px' }}>

      <nav style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c8f135, #ff5c35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#0d0d0d' }}>V</div>
          <span style={{ fontSize: '20px', fontWeight: '900' }}>VIT<span style={{ color: '#ff5c35' }}>Loop</span></span>
        </div>
        <button onClick={handleLogout}
          style={{ background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '10px', padding: '8px 16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
          Logout
        </button>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 20px' }}>

        {success && (
          <div style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#c8f135' }}>
            ✅ {success}
          </div>
        )}

        {/* PROFILE CARD */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, #1a3cff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                {user?.photoURL ? <img src={user.photoURL} style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>{profile.name || user?.displayName || 'VIT Student'}</h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{user?.email}</p>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)}
              style={{ background: editing ? 'rgba(255,92,53,0.1)' : 'rgba(200,241,53,0.1)', color: editing ? '#ff5c35' : '#c8f135', border: `1px solid ${editing ? 'rgba(255,92,53,0.2)' : 'rgba(200,241,53,0.2)'}`, borderRadius: '10px', padding: '8px 16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
              {editing ? 'Cancel' : '✏️ Edit'}
            </button>
          </div>

          {editing ? (
            <div>
              {[
                { label: 'Full Name', key: 'name', placeholder: 'Your full name' },
                { label: 'Phone (WhatsApp)', key: 'phone', placeholder: '9876543210' },
                { label: 'Department', key: 'department', placeholder: 'e.g. CSE, ECE, MECH' },
                { label: 'Year', key: 'year', placeholder: 'e.g. 1st, 2nd, 3rd, 4th' },
                { label: 'Hostel / Block', key: 'hostel', placeholder: 'e.g. Block A, Room 204' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '6px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{field.label}</label>
                  <input value={profile[field.key] || ''} onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}
              <button onClick={saveProfile} disabled={saving}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', fontFamily: 'inherit' }}>
                {saving ? 'Saving...' : 'Save Profile ✅'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Phone', value: profile.phone, icon: '📞' },
                { label: 'Department', value: profile.department, icon: '🎓' },
                { label: 'Year', value: profile.year, icon: '📅' },
                { label: 'Hostel', value: profile.hostel, icon: '🏠' },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{item.icon} {item.label}</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: item.value ? '#fff' : 'rgba(255,255,255,0.2)' }}>{item.value || 'Not set'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHANGE PASSWORD */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800' }}>🔒 Change Password</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 characters)"
              style={{ flex: 1, padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={changePassword}
              style={{ padding: '11px 20px', background: 'rgba(200,241,53,0.1)', color: '#c8f135', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '10px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Update
            </button>
          </div>
        </div>

        {/* MY LISTINGS */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800' }}>🏪 My Listings ({myListings.length})</h3>
          {myListings.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>No listings yet. Start selling!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myListings.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {item.imageUrl ? <img src={item.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{item.title}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>₹{item.price} · {item.type}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteListing(item.id)}
                    style={{ background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}