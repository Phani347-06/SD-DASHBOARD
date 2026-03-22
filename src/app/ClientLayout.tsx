"use client";

import React, { useEffect } from 'react';
import { SecurityProvider } from '@/context/SecurityContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force Refresh Protocol: Unregister any legacy service workers to purge stale PWA code
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for(let registration of registrations) {
          registration.unregister();
        }
      });

      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        // Register SW with a versioned hash to bypass ALL caches
        navigator.serviceWorker.register('/sw.js?v=4', { updateViaCache: 'none' })
          .then((registration) => {
            registration.update();
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                    window.location.reload();
                  }
                });
              }
            });
          });
      }
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

