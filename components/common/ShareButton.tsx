'use client';

import { Share2, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ShareButtonProps {
  title: string;
  url: string;
  locale: string;
}

export function ShareButton({ title, url, locale }: ShareButtonProps) {
  const t = useTranslations('share');
  const [copied, setCopied] = useState(false);

  // Localized share text
  const getShareText = () => {
    const texts: Record<string, string> = {
      ko: `${title} - 야간/주말/휴일 참고가격을 NightTicker에서 확인하세요!`,
      ja: `${title} - 夜間・週末・祝日の参考価格をNightTickerで確認!`,
      zh: `${title} - 在NightTicker查看夜间/周末/节假日参考价格!`,
      pt: `${title} - Confira precos noturnos/fim de semana/feriados no NightTicker!`,
      es: `${title} - Consulta precios nocturnos/fin de semana/festivos en NightTicker!`,
      en: `${title} - Check overnight/weekend/holiday reference prices on NightTicker!`,
    };
    return texts[locale] || texts.en;
  };

  const shareText = getShareText();

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  // Check if native share is available
  const canNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{t('share')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            {t('shareNative')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="h-4 w-4 mr-2" />
          {copied ? t('copied') : t('copyLink')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <span className="mr-2">𝕏</span>
          {t('shareTwitter')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
