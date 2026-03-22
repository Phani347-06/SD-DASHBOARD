"use client";

import React, { useEffect } from 'react';
import { SecurityProvider } from '@/context/SecurityContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('PWA Manifestation Failure: Secure Node connection aborted.', err);
          });
        });
      } else {
        console.warn('PWA Registration Restricted: Mobile browser requires HTTPS node to manifest Install Protocol.');
      }
    }
  }, []);

  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}
