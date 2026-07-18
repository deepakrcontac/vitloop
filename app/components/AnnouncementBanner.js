'use client';
// app/components/AnnouncementBanner.js
//
// A prominent announcement box for the homepage, editable by admins only —
// no code changes or redeploys needed to update it. Reuses the SAME admin
// unlock you already have (the 5-tap secret + 'deeplooop' password on
// Chat/Feed pages) — this component just checks the same localStorage
// 'isAdmin' flag those set.
//
// How it works:
//   - The announcement text lives in Firestore at settings/announcement
//   - Every visitor reads it in real time — no refresh needed after an edit
//   - If you're in admin mode (localStorage.isAdmin === 'true'), you'll see
//     a small ✏️ button to open the editor right on this banner — no need
//     to go anywhere else.
//   - Dismissing the banner only hides THAT specific update for that
//     visitor — the moment you publish a new one, it reappears for
//     everyone automatically.

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftLink, setDraftLink] = useState('');
  const [draftLinkLabel, setDraftLinkLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') setIsAdmin(true);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'announcement'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setAnnouncement(d);
        const dismissKey = `vitloop_announcement_dismissed_${d.updatedAt?.toMillis?.() || ''}`;
        setDismissed(!!localStorage.getItem(dismissKey));
      }
    });
    return () => unsub();
  }, []);

  const openEditor = () => {
    setDraftText(announcement?.text || '');
    setDraftLink(announcement?.link || '');
    setDraftLinkLabel(announcement?.linkLabel || '');
    setEditing(true);
  };

  const save = async (active) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'announcement'), {
        text: draftText.trim(),
        link: draftLink.trim(),
        linkLabel: draftLinkLabel.trim(),
        active,
        updatedAt: serverTimestamp(),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const dismiss = () => {
    if (announcement?.updatedAt) {
      localStorage.setItem(`vitloop_announcement_dismissed_${announcement.updatedAt.toMillis()}`, 'true');
    }
    setDismissed(true);
  };

  // ---- Admin editor view ----
  if (editing) {
    return (
      <div style={{
        margin: '12px 16px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
        borderRadius: '14px', padding: '16px',
      }}>
        <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: '#a78bfa' }}>✏️ Edit Announcement (Admin)</p>
        <textarea value={draftText} onChange={e => setDraftText(e.target.value)} maxLength={140} rows={2}
          placeholder="e.g. New: Tribe is live — find your gang, anonymously."
          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '10px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: 'rgba(255,255,255,0.06)', color: '#fff', resize: 'vertical', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input value={draftLink} onChange={e => setDraftLink(e.target.value)} placeholder="Link (optional, e.g. /profile)"
            style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box' }} />
          <input value={draftLinkLabel} onChange={e => setDraftLinkLabel(e.target.value)} placeholder="Button text (e.g. Try →)"
            style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', outline: 'none', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setEditing(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
          {announcement?.active && (
            <button onClick={() => save(false)} disabled={saving} style={{ background: 'rgba(255,92,53,0.15)', border: '1px solid rgba(255,92,53,0.3)', borderRadius: '8px', padding: '8px 14px', color: '#ff5c35', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Turn off</button>
          )}
          <button onClick={() => save(true)} disabled={saving || !draftText.trim()} style={{ flex: 1, background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', border: 'none', borderRadius: '8px', padding: '8px 14px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', opacity: saving || !draftText.trim() ? 0.6 : 1 }}>
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    );
  }

  // ---- Nothing to show, no admin controls needed ----
  if ((!announcement?.active || dismissed) && !isAdmin) return null;

  // ---- Admin sees an "add announcement" prompt even with nothing live ----
  if (!announcement?.active || dismissed) {
    return (
      <div style={{ margin: '12px 16px' }}>
        <button onClick={openEditor} style={{ background: 'rgba(108,99,255,0.08)', border: '1px dashed rgba(108,99,255,0.3)', borderRadius: '10px', padding: '8px 14px', color: 'rgba(167,139,250,0.6)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
          + Add announcement (admin only)
        </button>
      </div>
    );
  }

  // ---- Live announcement banner ----
  return (
    <div style={{
      margin: '12px 16px',
      background: 'linear-gradient(135deg, rgba(108,99,255,0.18), rgba(0,212,255,0.1))',
      border: '1px solid rgba(108,99,255,0.35)',
      borderRadius: '16px',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <span style={{ fontSize: '22px', flexShrink: 0 }}>📢</span>
      <p style={{ flex: 1, margin: 0, fontSize: '13.5px', fontWeight: '600', color: '#fff', lineHeight: '1.4' }}>
        {announcement.text}
      </p>
      {announcement.link && (
        <a href={announcement.link} onClick={dismiss} style={{
          flexShrink: 0, background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', color: '#fff',
          fontSize: '12px', fontWeight: '700', padding: '8px 14px', borderRadius: '9px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          {announcement.linkLabel || 'View →'}
        </a>
      )}
      {isAdmin && (
        <button onClick={openEditor} aria-label="Edit" style={{ flexShrink: 0, background: 'none', border: 'none', color: '#a78bfa', fontSize: '14px', cursor: 'pointer' }}>✏️</button>
      )}
      <button onClick={dismiss} aria-label="Dismiss" style={{ flexShrink: 0, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '15px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
    </div>
  );
}
