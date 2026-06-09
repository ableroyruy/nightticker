import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
