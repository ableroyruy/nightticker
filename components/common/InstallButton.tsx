'use client';

import { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const t = useTranslations('common');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Desktop - use native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      // iOS - show hint
      setShowIOSHint(true);
      setTimeout(() => setShowIOSHint(false), 5000);
    }
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Don't show if not installable and not iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstallClick}
        className="gap-2 bg-primary/10 hover:bg-primary/20 border-primary/30"
      >
        {isIOS ? (
          <Plus className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{t('install')}</span>
      </Button>

      {/* iOS Hint Tooltip */}
      {showIOSHint && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-50 w-64 text-sm">
          <p className="text-center">
            {t('installHint')}
          </p>
          <div className="mt-2 text-center text-muted-foreground text-xs">
            Safari: <span className="inline-flex items-center gap-1">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              → &quot;Add to Home Screen&quot;
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
