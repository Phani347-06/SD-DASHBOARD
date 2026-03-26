"use client";

import React, { useEffect } from 'react';
import { SecurityProvider } from '@/context/SecurityContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 🚀 SCORCHED EARTH CACHE BUSTING PROTOCOL 🚀
    // Mobile browsers (especially iOS Safari / Android Chrome) aggressively cache PWAs.
    // We are completely destroying all Service Workers and Caches to force an update.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }

    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) {
          caches.delete(name);
        }
      });
    }

    // Force a hard reload ONE time to ensure the user gets off the cached version
    const appVersion = 'v1.0.5'; // Change this string to force all mobile users to hard-refresh
    if (localStorage.getItem('app_version') !== appVersion) {
      localStorage.setItem('app_version', appVersion);
      window.location.reload(); // Force hard refresh from network
    }
    
    // Identity Pulse Buffer: Clear stale redirects
    localStorage.removeItem('redirect_after_login');
  }, []);

  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}

