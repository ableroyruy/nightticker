'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { saveLanguage, SupportedLanguage } from '@/lib/utils/getPreferredMarketOrder';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ko', label: '한국어', flag: 'KO' },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: SupportedLanguage) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    // Save to localStorage
    saveLanguage(newLocale);

    // Update URL
    let newPath = pathname;
    if (newLocale === 'ko') {
      if (!pathname.startsWith('/ko')) {
        newPath = `/ko${pathname}`;
      }
    } else {
      if (pathname.startsWith('/ko')) {
        newPath = pathname.replace('/ko', '') || '/';
      }
    }

    setIsOpen(false);
    router.push(newPath);
  };

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 h-9 px-3"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium">{currentLang.flag}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 glass-card border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={cn(
                'w-full px-4 py-2.5 text-left flex items-center justify-between transition-colors',
                locale === lang.code
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
            >
              <span className="text-sm font-medium">{lang.label}</span>
              {locale === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
