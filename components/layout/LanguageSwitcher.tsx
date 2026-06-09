'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ko' : 'en';

    // Remove current locale prefix and add new one
    let newPath = pathname;
    if (pathname.startsWith('/ko')) {
      newPath = pathname.replace('/ko', '') || '/';
    } else {
      newPath = `/ko${pathname}`;
    }

    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'en' ? '한국어' : 'English'}</span>
    </Button>
  );
}
