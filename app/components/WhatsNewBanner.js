'use client';
// app/components/WhatsNewBanner.js
//
// A slim one-line strip announcing Tribe is live. Drop <WhatsNewBanner />
// near the top of your homepage, just under the nav.

import { useEffect, useState } from 'react';
import Link from 'next/link';

const DISMISS_KEY = 'vitloop_whatsnew_tribe_dismissed';

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      margin: '8px 16px',
      background: 'rgba(108,99,255,0.12)',
      border: '1px solid rgba(108,99,255,0.25)',
      borderRadius: '10px',
      padding: '7px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '11.5px',
    }}>
      <span style={{ flexShrink: 0 }}>✨</span>
      <span style={{ flex: 1, color: 'rgba(255,255,255,0.8)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <strong style={{ color: '#fff' }}>New:</strong> Tribe is live — find your gang, anonymously.
      </span>
      <Link href="/profile" onClick={dismiss} style={{
        flexShrink: 0, color: '#a78bfa', fontWeight: '700', textDecoration: 'none', fontSize: '11.5px',
      }}>
        Try →
      </Link>
      <button onClick={dismiss} aria-label="Dismiss" style={{
        flexShrink: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
        fontSize: '13px', cursor: 'pointer', padding: '0 2px', lineHeight: 1,
      }}>
        ✕
      </button>
    </div>
  );
}
