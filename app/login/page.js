'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ hd: 'vitstudent.ac.in' });
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email.endsWith('@vit.ac.in') && !email.endsWith('@vitstudent.ac.in')) {
        await auth.signOut();
        setError('Only VIT email addresses allowed! Please use your college Google account.');
        setLoading(false);
        return;
      }
      router.push('/feed');
    } catch (err) {
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!email || (!isForgot && !password)) { setError('Please fill in all fields!'); return; }
    if (!email.endsWith('@vit.ac.in') && !email.endsWith('@vitstudent.ac.in')) {
      setError('Only VIT email addresses allowed!');
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
      else if (err.code === 'auth/wrong-password') setError('Wrong password. Try again.');
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
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,241,53,0.08) 0%, transparent 70%)', top: '-100px', left: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,92,53,0.08) 0%, transparent 70%)', bottom: '-80px', right: '-80px', pointerEvents: 'none' }} />

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:focus { border-color: rgba(200,241,53,0.5) !important; box-shadow: 0 0 0 3px rgba(200,241,53,0.1) !important; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '40px 36px',
        backdropFilter: 'blur(20px)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '2px', background: 'linear-gradient(90deg, transparent, #c8f135, #ff5c35, transparent)', borderRadius: '2px' }} />

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #c8f135, #ff5c35)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: '#0d0d0d', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(200,241,53,0.3)' }}>V</div>
          <h1 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-0.5px' }}>VIT<span style={{ color: '#ff5c35' }}>Loop</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', margin: 0 }}>
            {isForgot ? 'Reset your password' : isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* VIT BADGE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.15)', borderRadius: '100px', padding: '6px 14px', marginBottom: '24px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c8f135', boxShadow: '0 0 6px #c8f135' }} />
          <span style={{ fontSize: '12px', color: 'rgba(200,241,53,0.8)', fontWeight: '600' }}>VIT Students Only</span>
        </div>

        {/* GOOGLE LOGIN BUTTON */}
        {!isForgot && (
          <button onClick={handleGoogleLogin} disabled={loading}
            style={{ width: '100%', padding: '13px', background: '#fff', color: '#1a1a1a', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google (VIT Account)'}
          </button>
        )}

        {/* DIVIDER */}
        {!isForgot && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or use VIT email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          </div>
        )}

        {/* ERROR / SUCCESS */}
        {error && (
          <div style={{ background: 'rgba(255,92,53,0.1)', border: '1px solid rgba(255,92,53,0.2)', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#ff8066' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(200,241,53,0.1)', border: '1px solid rgba(200,241,53,0.2)', borderRadius: '10px', padding: '11px 14px', marginBottom: '16px', fontSize: '13px', color: '#c8f135' }}>
            ✅ {success}
          </div>
        )}

        {/* EMAIL INPUT */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>VIT Email</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>📧</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="yourname@vitstudent.ac.in"
              style={{ width: '100%', padding: '13px 14px 13px 42px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* PASSWORD INPUT */}
        {!isForgot && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '7px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Min. 6 characters"
                style={{ width: '100%', padding: '13px 44px 13px 42px', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box' }} />
              <button onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
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
          style={{ width: '100%', padding: '14px', background: loading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #c8f135, #a8d020)', color: loading ? 'rgba(255,255,255,0.3)' : '#0d0d0d', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 20px rgba(200,241,53,0.3)' }}>
          {loading ? '⏳ Please wait...' : isForgot ? '📨 Send Reset Email' : isSignup ? '🚀 Create Account' : '⚡ Login'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {isForgot ? (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Remember your password?{' '}
            <span onClick={() => { setIsForgot(false); setError(''); setSuccess(''); }}
              style={{ color: '#c8f135', cursor: 'pointer', fontWeight: '700' }}>Back to Login</span>
          </p>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span onClick={() => { setIsSignup(!isSignup); setError(''); setSuccess(''); }}
              style={{ color: '#c8f135', cursor: 'pointer', fontWeight: '700' }}>
              {isSignup ? 'Login' : 'Sign Up'}
            </span>
          </p>
        )}
        <div style={{ position: 'absolute', bottom: '-1px', left: '50%', transform: 'translateX(-50%)', width: '40%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,92,53,0.5), transparent)', borderRadius: '2px' }} />
      </div>
    </div>
  );
}