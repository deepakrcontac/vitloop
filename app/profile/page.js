'use client';
import { useState } from 'react';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #0d0d0d 100%)', fontFamily: "'Segoe UI', sans-serif", color: '#fff', paddingBottom: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤝</div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 10px' }}>Find a Friend</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Coming Soon — Connect with VITians who match your vibe!</p>
      </div>
      <BottomNav />
    </div>
  );
}