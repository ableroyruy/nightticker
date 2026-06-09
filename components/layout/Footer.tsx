import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const prefix = locale === 'ko' ? '/ko' : '';

  const footerLinks = [
    { href: `${prefix}/about`, label: t('nav.about') },
    { href: `${prefix}/disclaimer`, label: t('nav.disclaimer') },
    { href: `${prefix}/privacy`, label: t('nav.privacy') },
    { href: `${prefix}/terms`, label: t('nav.terms') },
    { href: `${prefix}/how-data-works`, label: t('nav.howDataWorks') },
    { href: `${prefix}/what-is-hyperliquid`, label: t('nav.whatIsHyperliquid') },
  ];

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 space-y-6">
        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Separator />

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center max-w-4xl mx-auto leading-relaxed">
          {t('footer.disclaimer')}
        </div>

        <Separator />

        {/* Copyright */}
        <div className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} {t('footer.copyright')}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
