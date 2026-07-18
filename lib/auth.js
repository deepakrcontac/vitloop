// lib/auth.js
//
// Every page that needs to know "who is this browser" should use useUid()
// instead of auth.currentUser (which is often null on first render) or the
// old getDeviceId() localStorage hack. This hook signs the visitor in
// anonymously via Firebase the first time they show up, and gives you a
// stable uid that's ready to use everywhere — Help Board, marketplace chat,
// notifications, and Vibe Match all key off this same id.

import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export function useUid() {
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        signInAnonymously(auth).catch((err) => {
          console.error('Anonymous sign-in failed:', err);
        });
      }
    });
    return () => unsub();
  }, []);

  return uid;
}
