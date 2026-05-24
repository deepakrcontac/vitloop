'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email || (!isForgot && !password)) { setError('Please fill in all fields!'); return; }
    if (!email.endsWith('@vit.ac.in') && !email.endsWith('@vitstudent.ac.in')) {
      setError('Only VIT email addresses allowed! Use @vit.ac.in or @vitstudent.ac.in');
      return;
    }
    setLoading(true);
    try {
      if (isForgot) {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset email sent! Check your inbox.');
        setLoading(false);
        return;
      }
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/feed');
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found. Please sign up first.');
      else if (err.code === 'auth/wrong-password') setError('Wrong password. Try again or reset it.');
      else if (err.code === 'auth/email-already-in-use') setError('Email already registered. Please login.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 40%, #16213e 70%, #0d0d0d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>

      {/* 3D BACKGROUND BLOBS */}
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,241,53,0.08) 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,53,0.08) 0%, transparent 70%)', bottom: '-80px', right: '-80px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,60,255,0.1) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />

      {/* FLOATING PARTICLES */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${6 + i * 2}px`, height: `${6 + i * 2}px`,
          borderRadius: '50%',
          background: i % 2 === 0 ? 'rgba(200,241,53,0.3)' : 'rgba(255,92,53,0.3)',
          top: `${10 + i * 15}%`,
          left: `${5 + i * 14}%`,
          animation: `float${i} ${3 + i}s ease-in-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      <style>{`
        @keyframes float0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(14px)} }
        @keyframes float4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float5 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
        @keyframes shimmer { 0%{box-shadow:0 0 20px rgba(200,241,53,0.1)} 50%{box-shadow:0 0 40px rgba(200,241,53,0.2), 0 0 80px rgba(255,92,53,0.1)} 100%{box-shadow:0 0 20px rgba(200,241,53,0.1)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:focus { border-color: rgba(200,241,53,0.5) !important; box-shadow: 0 0 0 3px rgba(200,241,53,0.1) !important; }
      `}</style>

      {/* MAIN CARD */}
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px 36px',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
        animation: 'shimmer 4s ease-in-out infinite',
      }}>

        {/* TOP CORNER DECORATION */}
        <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '2px', background: 'linear-gradient(90deg, transparent, #c8f135, #ff5c35, transparent)', borderRadius: '2px' }} />

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #c8f135, #ff5c35)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '900', color: '#0d0d0d',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(200,241,53,0.3)',
            transform: 'perspective(100px) rotateX(5deg)',
          }}>V</div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            VIT<span style={{ color: '#ff5c35' }}>Loop</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
            {isForgot ? 'Reset your password' : isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* VIT ONLY BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: '100px', padding: '6px 14px', marginBottom: '24px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8f135', boxShadow: '0 0 6px #c8f135' }} />
          <span style={{ fontSize: '12px', color: 'rgba(200,241,53,0.8)', fontWeight: '600' }}>VIT Students Only — @vit.ac.in</span>
        </div>

        {/* ERROR / SUCCESS */}
        {error && (
          <div style={{ background: 'rgba(255,92,53,0.1)', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#ff8066', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#c8f135', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ {success}
          </div>
        )}

        {/* EMAIL INPUT */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>VIT Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>📧</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="yourname@vit.ac.in"
              style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* PASSWORD INPUT */}
        {!isForgot && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Min. 6 characters"
                style={{ width: '100%', padding: '13px 44px 13px 42px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px', color: 'rgba(255,255,255,0.4)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD LINK */}
        {!isSignup && !isForgot && (
          <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '20px' }}>
            <span onClick={() => { setIsForgot(true); setError(''); setSuccess(''); }}
              style={{ fontSize: '12px', color: 'rgba(200,241,53,0.7)', cursor: 'pointer', fontWeight: '600' }}>
              Forgot password?
            </span>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <button onClick={handleSubmit} disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #c8f135, #a8d020)',
            color: loading ? 'rgba(255,255,255,0.3)' : '#0d0d0d',
            borderRadius: '12px', border: 'none',
            fontSize: '15px', fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(200,241,53,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            letterSpacing: '0.3px',
          }}
          onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(200,241,53,0.4)'; }}}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(200,241,53,0.3)'; }}>
          {loading ? '⏳ Please wait...' : isForgot ? '📨 Send Reset Email' : isSignup ? '🚀 Create Account' : '⚡ Login to VITLoop'}
        </button>

        {/* DIVIDER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* TOGGLE LOGIN/SIGNUP/FORGOT */}
        {isForgot ? (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Remember your password?{' '}
            <span onClick={() => { setIsForgot(false); setError(''); setSuccess(''); }}
              style={{ color: '#c8f135', cursor: 'pointer', fontWeight: '700' }}>
              Back to Login
            </span>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <span onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(''); }}
              style={{ color: '#c8f135', cursor: 'pointer', fontWeight: '700' }}>
              {isSignup ? 'Login' : 'Sign Up'}
            </span>
          </p>
        )}

        {/* BOTTOM DECORATION */}
        <div style={{ position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)', width: '40%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,92,53,0.5), transparent)', borderRadius: '2px' }} />
      </div>
    </div>
  );
}