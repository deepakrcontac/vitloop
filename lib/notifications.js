'use client';
// lib/notifications.js
//
// 🔧 FIX: the previous version combined where('userId','==',uid) with
// orderBy('createdAt','desc') in the same query. Firestore requires a
// composite index for that combination — without it, the query throws in
// the background and the bell just silently never updates. That's almost
// certainly why notifications weren't showing up.
//
// Fix: query with ONLY the `where` clause (no orderBy — that only needs
// Firestore's automatic single-field index, always available instantly),
// then sort and trim to the latest 30 in plain JavaScript after the data
// arrives. Same end result, no index needed, no setup step in Firebase
// Console required.

import { db } from './firebase';
import {
  collection, addDoc, serverTimestamp, query, where,
  onSnapshot, doc, updateDoc, writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

export async function pushNotification({ userId, type, title, body, link, fromUid }) {
  if (!userId || userId === fromUid) return; // never notify yourself
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      body: (body || '').slice(0, 120),
      link: link || '/',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Notification write failed:', err);
  }
}

export function useNotifications(uid) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!uid) return;
    // No orderBy here on purpose — see note above.
    const q = query(collection(db, 'notifications'), where('userId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort newest-first in JS, then keep only the latest 30.
        items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setNotifications(items.slice(0, 30));
      },
      (err) => console.error('Notifications listener failed:', err)
    );
    return () => unsub();
  }, [uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => batch.update(doc(db, 'notifications', n.id), { read: true }));
    await batch.commit();
  };

  return { notifications, unreadCount, markAsRead, markAllRead };
}
