import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://nightticker.com'),
  title: {
    default: 'NightTicker - The Market Never Sleeps',
    template: '%s | NightTicker',
  },
  description: 'Monitor stock-related market activity when traditional exchanges are closed. Overnight, weekend, and holiday reference prices powered by Hyperliquid Market Prices.',
  keywords: ['night stock price', 'overnight stock price', 'weekend stock price', 'market closed price', 'hyperliquid'],
  authors: [{ name: 'NightTicker' }],
  openGraph: {
    type: 'website',
    siteName: 'NightTicker',
    title: 'NightTicker - The Market Never Sleeps',
    description: 'Monitor stock-related market activity when traditional exchanges are closed.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NightTicker - The Market Never Sleeps',
    description: 'Monitor stock-related market activity when traditional exchanges are closed.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
