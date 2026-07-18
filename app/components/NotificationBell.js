'use client';
// app/components/NotificationBell.js
//
// Drop this into the nav of any page, next to the nickname button:
//   <NotificationBell uid={uid} />

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../lib/notifications';

function timeAgo(ts) {
  if (!ts?.toDate) return '';
  const s = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({ uid }) {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications(uid);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n) => {
    if (!n.read) markAsRead(n.id);
    setOpen(false);
    router.push(n.link || '/');
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        style={{
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '50%',
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          fontSize: '16px',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ff5c35',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '800',
              borderRadius: '10px',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '42px',
            width: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: 'rgba(13,13,20,0.98)',
            border: '1px solid rgba(108,99,255,0.25)',
            borderRadius: '14px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 200,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <p style={{ padding: '30px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
              Nothing yet
            </p>
          )}

          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                background: n.read ? 'transparent' : 'rgba(108,99,255,0.08)',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
              }}
            >
              <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '700', color: '#fff' }}>{n.title}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: 'rgba(255,255,255,0.5)' }}>{n.body}</p>
              <p style={{ margin: '4px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>{timeAgo(n.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
