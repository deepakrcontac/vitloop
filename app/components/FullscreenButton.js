'use client';
// app/components/FullscreenButton.js
//
// One click, uses the browser's native Fullscreen API — hides the tab bar,
// URL bar, everything, right in Chrome/Edge/Firefox on both desktop and
// Android. Note: iOS Safari does not support this API for regular
// webpages (Apple restriction, not something we can work around) — for
// iPhone users, the PWA "Add to Home Screen" route (see InstallPrompt)
// is the real fullscreen solution there.
//
// This button auto-hides itself on browsers that don't support the API at
// all, so no one sees a broken button.

import { useEffect, useState } from 'react';

export default function FullscreenButton() {
  const [supported, setSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setSupported(!!document.documentElement.requestFullscreen);
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!supported) return null;

  return (
    <button onClick={toggle} aria-label="Toggle fullscreen" style={{
      background: 'rgba(108,99,255,0.15)',
      border: '1px solid rgba(108,99,255,0.3)',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '14px',
      color: '#a78bfa',
      flexShrink: 0,
    }}>
      {isFullscreen ? '⤦' : '⤢'}
    </button>
  );
}
