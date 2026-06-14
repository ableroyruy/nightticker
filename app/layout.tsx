import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nightticker.com'),
  title: {
    default: 'NightTicker - The Market Never Sleeps',
    template: '%s | NightTicker',
  },
  description: 'Monitor stock-related market activity when traditional exchanges are closed. Overnight, weekend, and holiday reference prices powered by Hyperliquid Market Prices.',
  keywords: ['night stock price', 'overnight stock price', 'weekend stock price', 'market closed price', 'hyperliquid'],
  authors: [{ name: 'NightTicker' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    siteName: 'NightTicker',
    title: 'NightTicker - The Market Never Sleeps',
    description: 'Monitor stock-related market activity when traditional exchanges are closed.',
    images: [
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'NightTicker',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'NightTicker - The Market Never Sleeps',
    description: 'Monitor stock-related market activity when traditional exchanges are closed.',
    images: ['/android-chrome-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'msapplication-TileImage': '/android-chrome-192x192.png',
    'msapplication-TileColor': '#0D0E14',
    'theme-color': '#0D0E14',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
