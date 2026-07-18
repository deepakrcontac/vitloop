'use client';
// app/components/InstallPrompt.js
//
// This is the MORE reliable fullscreen solution, especially on iPhone.
// Once someone "installs" (Add to Home Screen), the app opens with zero
// browser chrome — no URL bar, no tabs, just VITLoop, exactly like a
// native app, and it works this way every time they open it from their
// home screen icon.
//
// Android/Chrome: fires a real "install" prompt we can trigger with one tap.
// iOS Safari: doesn't allow triggering this programmatically (Apple
// restriction) — so we show instructions instead ("Tap Share, then
// Add to Home Screen").

import { useEffect, useState } from 'react';

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone()) return; // already installed, nothing to show
    if (localStorage.getItem('vitloop_install_dismissed') === 'true') return;

    if (isIOS()) {
      setShowIOSHint(true);
      setDismissed(false);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setDismissed(false);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setDismissed(true);
  };

  const dismiss = () => {
    localStorage.setItem('vitloop_install_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed || (!deferredPrompt && !showIOSHint)) return null;

  return (
    <div style={{
      margin: '10px 16px',
      background: 'rgba(200,241,53,0.08)',
      border: '1px solid rgba(200,241,53,0.25)',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '12px',
    }}>
      <span style={{ fontSize: '16px', flexShrink: 0 }}>📲</span>
      {showIOSHint ? (
        <span style={{ flex: 1, color: 'rgba(255,255,255,0.75)' }}>
          Install VITLoop: tap <strong>Share</strong> then <strong>Add to Home Screen</strong> for a full, browser-free app.
        </span>
      ) : (
        <span style={{ flex: 1, color: 'rgba(255,255,255,0.75)' }}>
          Install VITLoop as an app — full screen, no browser bar.
        </span>
      )}
      {!showIOSHint && (
        <button onClick={install} style={{
          flexShrink: 0, background: 'linear-gradient(135deg, #c8f135, #a8d020)', color: '#0d0d0d',
          fontWeight: '700', fontSize: '11.5px', padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
        }}>
          Install
        </button>
      )}
      <button onClick={dismiss} aria-label="Dismiss" style={{
        flexShrink: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '14px', cursor: 'pointer',
      }}>
        ✕
      </button>
    </div>
  );
}
