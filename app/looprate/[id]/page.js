'use client';
import { useEffect, useState } from 'react';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, addDoc, getDocs, deleteDoc, collection, serverTimestamp, query, orderBy, increment } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '../../components/BottomNav';

const POSITIVE_TAGS = ['Easy Marks', 'Good Teaching', 'Chill Faculty', 'Friendly', 'Placement Helpful', 'Easy CAT'];
const NEGATIVE_TAGS = ['Very Strict', 'Heavy Assignments', 'Surprise Tests', 'Fast Teaching', 'Low Marks'];

export default function FacultyPage() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(null);
  const [voting, setVoting] = useState(false);

  const isAdmin = auth.currentUser?.email === 'deepak.2024a@vitstudent.ac.in' ||
    auth.currentUser?.email === 'deepak.rcontact@gmail.com';

  useEffect(() => {
    fetchFaculty();
    fetchReviews();
    const v = localStorage.getItem('vote_' + id);
    if (v) setVoted(v);
  }, [id]);

  const fetchFaculty = async () => {
    try {
      const snap = await getDoc(doc(db, 'faculties', id));
      if (snap.exists()) setFaculty({ id: snap.id, ...snap.data() });
    } catch (e) {}
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'faculties', id, 'reviews'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {}
  };

  const vote = async (type) => {
    if (voted || voting) return;
    setVoting(true);
    try {
      await updateDoc(doc(db, 'faculties', id), {
        [type === 'green' ? 'greenFlags' : 'redFlags']: increment(1),
      });
      localStorage.setItem('vote_' + id, type);
      setVoted(type);
      fetchFaculty();
    } catch (e) {}
    setVoting(false);
  };

  const submitReview = async () => {
    if (!newReview.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'faculties', id, 'reviews'), {
        text: newReview,
        tags: selectedTags,
        userEmail: 'Anonymous VITian',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'faculties', id), { reviewCount: increment(1) });
      setNewReview('');
      setSelectedTags([]);
      fetchReviews();
      fetchFaculty();
    } catch (e) {}
    setSubmitting(false);
  };

  const deleteReview = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    await deleteDoc(doc(db, 'faculties', id, 'reviews', reviewId));
    setReviews(reviews.filter(r => r.id !== reviewId));
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const getScore = () => {
    if (!faculty) return 0;
    const total = (faculty.greenFlags || 0) + (faculty.redFlags || 0);
    if (total === 0) return 0;
    return Math.round(((faculty.greenFlags || 0) / total) * 100);
  };

  const score = getScore();
  const scoreColor = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171';
  const scoreLabel = score >= 70 ? 'Recommended ✅' : score >= 40 ? 'Mixed Reviews ⚠️' : 'Avoid if possible 🚫';
  const total = faculty ? (faculty.greenFlags || 0) + (faculty.redFlags || 0) : 0;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>Loading...</div>
  );

  if (!faculty) return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif', flexDirection: 'column', gap: '12px' }}>
      <p>Faculty not found</p>
      <Link href="/looprate" style={{ color: '#c8f135' }}>← Back to LoopRate</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '100px' }}>

      <nav style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)' }}>
        <Link href="/looprate" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '20px' }}>←</Link>
        <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #c8f135, #ff5c35)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '900', color: '#0d0d0d' }}>V</div>
        <div>
          <p style={{ margin: 0, fontWeight: '800', fontSize: '16px' }}>{faculty.name}</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{faculty.school}</p>
        </div>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>

       {/* FACULTY CARD */}
<div style={{ marginBottom: '20px' }}>
  {/* Full width image */}
  <div style={{
    width: '100%',
    height: '220px',
    borderRadius: '20px',
    overflow: 'hidden',
    marginBottom: '16px',
    position: 'relative',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    border: '1px solid rgba(255,255,255,0.1)',
  }}>
    {faculty.imageUrl
      ? <img src={faculty.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={faculty.name} />
      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>🎓</div>
    }
    {/* Gradient overlay */}
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      padding: '40px 20px 16px',
      background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
    }}>
      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900' }}>{faculty.name}</h2>
      <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{faculty.school} {faculty.subject ? `· ${faculty.subject}` : ''}</p>
    </div>
    {/* Score badge */}
    <div style={{
      position: 'absolute',
      top: '14px', right: '14px',
      width: '52px', height: '52px',
      borderRadius: '50%',
      border: `3px solid ${scoreColor}`,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 16px ${scoreColor}44`,
    }}>
      <span style={{ fontSize: '13px', fontWeight: '900', color: scoreColor }}>{total === 0 ? '?' : score + '%'}</span>
    </div>
  </div>

  <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
    <span style={{ fontSize: '13px', fontWeight: '700', color: scoreColor }}>{scoreLabel}</span>
    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{total} total votes</p>
  </div>

          {/* STATS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#4ade80' }}>{faculty.greenFlags || 0}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>🟢 Green Flags</p>
            </div>
            <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#f87171' }}>{faculty.redFlags || 0}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>🔴 Red Flags</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#c8f135' }}>{faculty.reviewCount || 0}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>💬 Reviews</p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          {total > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: score + '%', background: 'linear-gradient(90deg, #4ade80, #86efac)', borderRadius: '100px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', color: '#4ade80' }}>🟢 Positive</span>
                <span style={{ fontSize: '11px', color: '#f87171' }}>Negative 🔴</span>
              </div>
            </div>
          )}

          {/* VOTE BUTTONS */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => vote('green')} disabled={!!voted || voting}
              style={{ flex: 1, padding: '14px', background: voted === 'green' ? 'rgba(74,222,128,0.3)' : 'rgba(74,222,128,0.1)', border: `2px solid ${voted === 'green' ? '#4ade80' : 'rgba(74,222,128,0.3)'}`, borderRadius: '12px', color: '#4ade80', fontWeight: '800', fontSize: '15px', cursor: voted ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              🟢 Green Flag {voted === 'green' && '✓'}
            </button>
            <button onClick={() => vote('red')} disabled={!!voted || voting}
              style={{ flex: 1, padding: '14px', background: voted === 'red' ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.1)', border: `2px solid ${voted === 'red' ? '#f87171' : 'rgba(248,113,113,0.3)'}`, borderRadius: '12px', color: '#f87171', fontWeight: '800', fontSize: '15px', cursor: voted ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              🔴 Red Flag {voted === 'red' && '✓'}
            </button>
          </div>
          {voted && <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '10px', marginBottom: 0 }}>You already voted for this faculty</p>}
        </div>

        {/* WRITE REVIEW */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800' }}>💬 Write a Review</h3>
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Your review is 100% anonymous</p>

          <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Positive Tags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {POSITIVE_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                style={{ padding: '6px 12px', borderRadius: '100px', border: '1px solid', borderColor: selectedTags.includes(tag) ? '#4ade80' : 'rgba(74,222,128,0.2)', background: selectedTags.includes(tag) ? 'rgba(74,222,128,0.2)' : 'transparent', color: selectedTags.includes(tag) ? '#4ade80' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                {tag}
              </button>
            ))}
          </div>

          <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Negative Tags</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {NEGATIVE_TAGS.map(tag => (
              <button key={tag} onClick={() => toggleTag(tag)}
                style={{ padding: '6px 12px', borderRadius: '100px', border: '1px solid', borderColor: selectedTags.includes(tag) ? '#f87171' : 'rgba(248,113,113,0.2)', background: selectedTags.includes(tag) ? 'rgba(248,113,113,0.2)' : 'transparent', color: selectedTags.includes(tag) ? '#f87171' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                {tag}
              </button>
            ))}
          </div>

          <textarea value={newReview} onChange={e => setNewReview(e.target.value)}
            placeholder="Share your honest experience... (completely anonymous)"
            rows={3}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', marginBottom: '14px', boxSizing: 'border-box' }} />

          <button onClick={submitReview} disabled={submitting}
            style={{ width: '100%', padding: '13px', background: submitting ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #c8f135, #a8d020)', color: submitting ? 'rgba(255,255,255,0.3)' : '#0d0d0d', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Posting...' : 'Post Anonymous Review 🚀'}
          </button>
        </div>

        {/* REVIEWS */}
        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Student Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: '32px' }}>📝</p>
            <p>No reviews yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>🎭 Anonymous VITian</p>
                  {isAdmin && (
                    <button onClick={() => deleteReview(review.id)}
                      style={{ background: 'rgba(255,92,53,0.1)', color: '#ff5c35', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                      🗑️
                    </button>
                  )}
                </div>
                {review.tags && review.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {review.tags.map(tag => (
                      <span key={tag} style={{ padding: '3px 10px', borderRadius: '100px', background: POSITIVE_TAGS.includes(tag) ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', color: POSITIVE_TAGS.includes(tag) ? '#4ade80' : '#f87171', fontSize: '11px', fontWeight: '600' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6' }}>{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}