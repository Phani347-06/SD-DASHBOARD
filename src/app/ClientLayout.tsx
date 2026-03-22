"use client";

import React, { useEffect } from 'react';
import { SecurityProvider } from '@/context/SecurityContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        // Register SW and force update check
        navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
          .then((registration) => {
            // Force check for updates immediately
            registration.update();
            
            // When a new SW is found, make it activate immediately
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    // Reload the page to get fresh content
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch(err => {
            console.warn('SW registration failed:', err);
          });
      }
    }
  }, []);

  return (
    <SecurityProvider>
      {children}
    </SecurityProvider>
  );
}

