import { MetadataRoute } from 'next';

/**
 * 🛰️ Institutional PWA Manifest Manifestation
 * Configures the Laboratory Intelligence Node for PWA Deployment.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lab Intelligence Gateway',
    short_name: 'Lab Intel',
    description: 'Secure Institutional Lab Attendance Protocol',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0052a5',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
