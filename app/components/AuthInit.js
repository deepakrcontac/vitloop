'use client';
// app/components/AuthInit.js
//
// Renders nothing — just makes sure anonymous sign-in kicks off the moment
// the app loads, so by the time someone taps "Ask" or "Reply", auth.currentUser
// (or useUid()) is already populated instead of racing against it.

import { useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function AuthInit() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) signInAnonymously(auth).catch((err) => console.error('Anon sign-in failed:', err));
    });
    return () => unsub();
  }, []);

  return null;
}
