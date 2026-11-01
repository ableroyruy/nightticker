'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useId } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'ko', label: '한국어', flag: 'KO' },
  { code: 'ja', label: '日本語', flag: 'JA' },
  { code: 'zh', label: '简体中文', flag: 'ZH' },
  { code: 'pt', label: 'Português', flag: 'PT' },
  { code: 'es', label: 'Español', flag: 'ES' },
] as const;

/** Keep category selections, attribution parameters and anchors when changing language. */
export function localeDestination(pathname: string, locale: string, search = '', hash = '') {
  const path = pathname.replace(/^\/(?:en|ko|ja|zh|pt|es)(?=\/|$)/, '') || '/';
  return `${locale === 'en' ? '' : `/${locale}`}${path === '/' && locale !== 'en' ? '' : path}${search}${hash}`;
}

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();
  const label = { en: 'Choose language', ko: '언어 선택', ja: '言語を選択', zh: '选择语言', pt: 'Escolher idioma', es: 'Elegir idioma' }[locale as 'en' | 'ko' | 'ja' | 'zh' | 'pt' | 'es'] ?? 'Choose language';

  useEffect(() => {
    if (!isOpen) return;
    optionRefs.current[languages.findIndex(language => language.code === locale)]?.focus();
    const onOutside = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [isOpen, locale]);

  const close = () => { setIsOpen(false); triggerRef.current?.focus(); };
  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) { close(); return; }
    setLocaleCookie(newLocale);
    setIsOpen(false);
    window.location.assign(localeDestination(pathname, newLocale, window.location.search, window.location.hash));
  };
  const currentLang = languages.find(language => language.code === locale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef} onBlurCapture={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false);
    }} onKeyDown={event => {
      if (isOpen && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    }}>
      <Button ref={triggerRef} type="button" variant="ghost" size="sm"
        aria-label={`${label}: ${currentLang.label}`} aria-expanded={isOpen} aria-controls={listId}
        onClick={() => setIsOpen(!isOpen)} className="gap-2 h-11 px-3 sm:h-9">
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-medium">{currentLang.flag}</span>
      </Button>
      {isOpen && (
        <div id={listId} role="group" aria-label={label} className="absolute right-0 top-full mt-2 w-40 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          {languages.map((language, index) => (
            <button key={language.code} type="button" lang={language.code}
              ref={element => { optionRefs.current[index] = element; }}
              aria-pressed={locale === language.code}
              onClick={() => switchLocale(language.code)}
              onKeyDown={event => {
                let next: number | null = null;
                if (event.key === 'ArrowDown') next = (index + 1) % languages.length;
                if (event.key === 'ArrowUp') next = (index - 1 + languages.length) % languages.length;
                if (event.key === 'Home') next = 0;
                if (event.key === 'End') next = languages.length - 1;
                if (next !== null) { event.preventDefault(); optionRefs.current[next]?.focus(); }
              }}
              className={cn('w-full min-h-11 px-4 py-2.5 text-left flex items-center justify-between transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]', locale === language.code ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50')}>
              <span className="text-sm font-medium">{language.label}</span>
              {locale === language.code && <Check className="h-4 w-4 text-primary" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
