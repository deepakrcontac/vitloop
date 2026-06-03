'use client';
import { useState } from 'react';
import { auth, db } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // We use nickname@vitloop.app as fake email for Firebase Auth
  const fakeEmail = (nick) => `${nick.toLowerCase().replace(/\s+/g, '')}@vitloop.app`;

  const handleSubmit = async () => {
    setError('');
    if (!nickname.trim() || !password) {
      setError('Please enter your nickname and password!');
      return;
    }
    if (nickname.trim().length < 3) {
      setError('Nickname must be at least 3 characters!');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);

    const email = fakeEmail(nickname);

    try {
      if (isSignup) {
        // Check if nickname already taken
        const nickDoc = await getDoc(doc(db, 'nicknames', nickname.toLowerCase().replace(/\s+/g, '')));
        if (nickDoc.exists()) {
          setError('This nickname is already taken! Try another one 😅');
          setLoading(false);
          return;
        }
        // Create account
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Set display name
        await updateProfile(result.user, { displayName: nickname.trim() });
        // Save nickname to firestore
        await setDoc(doc(db, 'nicknames', nickname.toLowerCase().replace(/\s+/g, '')), {
          uid: result.user.uid,
          nickname: nickname.trim(),
          createdAt: new Date(),
        });
        router.push('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('Nickname not found! Please sign up first.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password! Try again.');
      else if (err.code === 'auth/email-already-in-use') setError('Nickname already taken! Try another.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters!');
      else setError('Something went wrong. Try again!');
      setLoading(false);
    }
  };

  const funNicknames = ['Jupiter', 'Naruto', 'Shadow', 'Phoenix', 'Cosmos', 'Ninja'];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #07070f 0%, #0d0d1a 50%, #07070f 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', bottom: '-60px', right: '-60px', pointerEvents: 'none' }}/>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:focus { border-color: rgba(108,99,255,0.5) !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.1) !important; }
      `}</style>

      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '36px 28px',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Top glow line */}
        <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '2px', background: 'linear-gradient(90deg, transparent, #6C63FF, #00D4FF, transparent)', borderRadius: '2px' }}/>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            VIT<span style={{ color: '#ff5c35' }}>Loop</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
            {isSignup ? 'Pick your anonymous identity' : 'Welcome back, anonymous!'}
          </p>
        </div>

        {/* ANONYMOUS BADGE */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          background: 'rgba(108,99,255,0.1)',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: '100px',
          padding: '7px 16px',
          marginBottom: '24px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }}/>
          <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>100% Anonymous · No real name needed</span>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{ background: 'rgba(255,92,53,0.1)', border: '1px solid rgba(255,92,53,0.25)', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#ff8066' }}>
            ⚠️ {error}
          </div>
        )}

        {/* NICKNAME INPUT */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Your Nickname
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🎭</span>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Jupiter, Naruto, Shadow..."
              style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.2s' }}
            />
          </div>
          {/* Nickname suggestions */}
          {isSignup && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
              {funNicknames.map(n => (
                <button key={n} onClick={() => setNickname(n)}
                  style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '100px', padding: '3px 10px', color: '#a78bfa', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PASSWORD INPUT */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Min. 6 characters"
              style={{ width: '100%', padding: '13px 44px 13px 42px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box', transition: 'all 0.2s' }}
            />
            <button onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #6C63FF, #00D4FF)',
            color: loading ? 'rgba(255,255,255,0.3)' : '#fff',
            borderRadius: '12px',
            border: 'none',
            fontSize: '15px',
            fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(108,99,255,0.4)',
            transform: loading ? 'none' : 'translateY(0)',
            transition: 'all 0.2s',
            marginBottom: '16px',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        >
          {loading ? '⏳ Please wait...' : isSignup ? '🚀 Create Anonymous Account' : '⚡ Enter VITLoop'}
        </button>

        {/* SWITCH */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px' }}>
          {isSignup ? 'Already have an account?' : "New to VITLoop?"}{' '}
          <span onClick={() => { setIsSignup(!isSignup); setError(''); }}
            style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: '700' }}>
            {isSignup ? 'Login' : 'Sign Up Free'}
          </span>
        </p>

        {/* PRIVACY NOTE */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '12px',
          textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.6' }}>
            🔒 No email · No phone · No real name<br/>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>Your identity stays anonymous forever</span>
          </p>
        </div>

        {/* Bottom glow line */}
        <div style={{ position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)', width: '40%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)', borderRadius: '2px' }}/>
      </div>
    </div>
  );
}