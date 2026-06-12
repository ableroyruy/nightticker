import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import { locales, Locale } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { InstallButton } from '@/components/layout/InstallButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { FavoritesProvider } from '@/lib/context/FavoritesContext';
import { SearchRankingProvider } from '@/lib/context/SearchRankingContext';
import { StockTicker } from '@/components/common/StockTicker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <JsonLd type="website" locale={locale} />
        <JsonLd type="organization" locale={locale} />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-880N7J6MBW" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-880N7J6MBW');
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <FavoritesProvider>
            <SearchRankingProvider>
              <InstallButton />
              <Header />
              <StockTicker />
              <main className="flex-1">{children}</main>
              <Footer />
            </SearchRankingProvider>
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
