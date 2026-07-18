'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { useUid } from '../../lib/auth';
import { pushNotification } from '../../lib/notifications';
import {
  doc, setDoc, getDoc, serverTimestamp,
  collection, query, orderBy, onSnapshot,
} from 'firebase/firestore';
import BottomNav from '../components/BottomNav';
import NotificationBell from '../components/NotificationBell';
import AvatarIcon from '../components/AvatarIcon';

// 🔧 Renamed away from "Date" per your request — avoids the app reading as
// a dating platform during any app-store or faculty review.
const LOOKING_FOR = {
  outing: { label: 'One Day Outing', emoji: '🎉', color: '#00D4FF' },
  hangout: { label: 'One Day Hangout', emoji: '💛', color: '#ec4899' },
  vibing: { label: 'Just Vibing', emoji: '🎮', color: '#c8f135' },
};

const GENDERS = ['Male', 'Female'];

function timeAgo(ts) {
  if (!ts?.toDate) return '';
  const s = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ProfilePage() {
  const uid = useUid();
  const router = useRouter();

  const [myProfile, setMyProfile] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [nickname, setNickname] = useState('Anonymous Vitian');
  const [editing, setEditing] = useState(false);

  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [locationFreeTime, setLocationFreeTime] = useState('');
  const [lookingFor, setLookingFor] = useState('vibing');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vitloop_nickname');
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const snap = await getDoc(doc(db, 'profiles', uid));
      if (snap.exists()) {
        const d = snap.data();
        setMyProfile(d);
        setGender(d.gender || '');
        setBio(d.bio || '');
        setLocationFreeTime(d.locationFreeTime || '');
        setLookingFor(d.lookingFor || 'vibing');
      }
      setLoadingMe(false);
    })();
  }, [uid]);

  useEffect(() => {
    const q = query(collection(db, 'profiles'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== uid));
    });
    return () => unsub();
  }, [uid]);

  const saveProfile = async () => {
    if (!uid || !bio.trim() || !gender) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'profiles', uid), {
        nickname, gender,
        bio: bio.trim(),
        locationFreeTime: locationFreeTime.trim(),
        lookingFor,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setMyProfile({ nickname, gender, bio, locationFreeTime, lookingFor });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const startChat = async (otherUid, otherNickname) => {
    if (!uid) return;
    const chatId = [uid, otherUid].sort().join('_');
    const ref = doc(db, 'vibeChats', chatId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { participants: [uid, otherUid], createdAt: serverTimestamp() });
      pushNotification({
        userId: otherUid,
        type: 'vibe_connect',
        title: 'Someone wants to connect! 🤝',
        body: `${nickname} said hi on Vibe Match`,
        link: `/vibechat/${chatId}`,
        fromUid: uid,
      });
    }
    router.push(`/vibechat/${chatId}`);
  };

  const wrap = { minHeight: '100vh', background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '90px' };
  const labelStyle = { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' };

  if (loadingMe) {
    return <div style={{ ...wrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'rgba(255,255,255,0.3)' }}>Loading...</p></div>;
  }

  const showForm = !myProfile || editing;

  return (
    <div style={wrap}>
      <nav style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <span style={{ color: '#a78bfa', fontSize: '14px', fontWeight: '600' }}>🫂 Tribe</span>
        <div style={{ marginLeft: 'auto' }}>
          <NotificationBell uid={uid} />
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px 16px' }}>

        {showForm ? (
          <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.06))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '20px', padding: '22px', marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800' }}>{myProfile ? 'Edit your profile' : 'Set up your profile'}</h2>
            <p style={{ margin: '0 0 18px', fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>Still 100% anonymous — this just helps people vibe with the right people.</p>

            <label style={labelStyle}>Gender</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              {GENDERS.map(g => (
                <button key={g} onClick={() => setGender(g)} style={{
                  padding: '10px 18px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                  borderColor: gender === g ? '#6C63FF' : 'rgba(255,255,255,0.12)',
                  background: gender === g ? 'rgba(108,99,255,0.2)' : 'transparent',
                  color: gender === g ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <AvatarIcon gender={g} size={22} /> {g}
                </button>
              ))}
            </div>
            <p style={{ margin: '0 0 18px', fontSize: '11.5px', color: '#7ecb3e', display: 'flex', alignItems: 'center', gap: '5px' }}>
              🔒 100% anonymous — no one can ever trace this back to you. No need to fake anything, just be you.
            </p>

            <label style={labelStyle}>What are you looking for?</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              {Object.entries(LOOKING_FOR).map(([key, v]) => (
                <button key={key} onClick={() => setLookingFor(key)} style={{
                  padding: '9px 14px', borderRadius: '10px', border: '1px solid', cursor: 'pointer', fontWeight: '700', fontSize: '13px',
                  borderColor: lookingFor === key ? v.color : 'rgba(255,255,255,0.12)',
                  background: lookingFor === key ? `${v.color}22` : 'transparent',
                  color: lookingFor === key ? v.color : 'rgba(255,255,255,0.5)',
                }}>{v.emoji} {v.label}</button>
              ))}
            </div>

            <label style={labelStyle}>A line about you</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={140} rows={2}
              placeholder="e.g. 3rd year CSE, into badminton and lo-fi playlists"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '18px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.07)', color: '#fff', resize: 'vertical', boxSizing: 'border-box' }} />

            <label style={labelStyle}>Location & free time</label>
            <input value={locationFreeTime} onChange={e => setLocationFreeTime(e.target.value)} maxLength={60}
              placeholder="e.g. MB Hostel, free most evenings"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '22px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.07)', color: '#fff', boxSizing: 'border-box' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              {editing && (
                <button onClick={() => setEditing(false)} style={{ flex: '0 0 auto', padding: '13px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
              <button onClick={saveProfile} disabled={saving || !bio.trim() || !gender} style={{
                flex: 1, padding: '13px', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
                border: 'none', borderRadius: '12px', color: '#fff', fontWeight: '800', fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !bio.trim() || !gender ? 0.6 : 1,
              }}>
                {saving ? 'Saving...' : myProfile ? 'Save changes' : 'Save & find people →'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: '16px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AvatarIcon gender={gender} size={30} />
              <div>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{nickname}</p>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{bio}</p>
              </div>
            </div>
            <button onClick={() => setEditing(true)} style={{ background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '6px 12px', color: '#a78bfa', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
              Edit
            </button>
          </div>
        )}

        {!showForm && (
          <>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
              {profiles.length} {profiles.length === 1 ? 'person' : 'people'} around campus
            </p>

            {profiles.length === 0 && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '40px' }}>No one's posted a profile yet — you're early!</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {profiles.map(p => {
                const lf = LOOKING_FOR[p.lookingFor] || LOOKING_FOR.vibing;
                return (
                  <div key={p.id} style={{ position: 'relative', background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
                    <span style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                      {timeAgo(p.updatedAt)}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <AvatarIcon gender={p.gender} size={28} />
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{p.nickname || 'Anonymous Vitian'}</p>
                        {p.gender && (
                          <p style={{ margin: 0, fontSize: '10.5px', color: 'rgba(255,255,255,0.35)' }}>{p.gender}</p>
                        )}
                      </div>
                    </div>

                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '3px 10px', borderRadius: '100px', background: `${lf.color}22`, color: lf.color, display: 'inline-block', marginBottom: '8px' }}>{lf.emoji} {lf.label}</span>

                    <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>{p.bio}</p>

                    {p.locationFreeTime && (
                      <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#a78bfa' }}>📍 {p.locationFreeTime}</p>
                    )}

                    <button onClick={() => startChat(p.id, p.nickname)} style={{ width: '100%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '10px', padding: '9px', color: '#fff', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer' }}>
                      💬 Say Hi
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
