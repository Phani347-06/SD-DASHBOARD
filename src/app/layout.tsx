import type { Metadata, Viewport } from "next";
import "./globals.css";

import ClientLayout from "./ClientLayout";

export const viewport: Viewport = {
  themeColor: '#0052a5',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: "Lab Intelligence",
  description: "Secure Lab Attendance Protocol",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lab Intelligence',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8fafc] text-slate-900">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
