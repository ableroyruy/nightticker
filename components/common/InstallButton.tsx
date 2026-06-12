'use client';

import { useState, useEffect } from 'react';
import { Download, Plus, Smartphone } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Detect mobile
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    // Listen for beforeinstallprompt (Android/Desktop Chrome)
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
      // Android/Desktop Chrome - use native prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Show manual install hint
      setShowHint(true);
      setTimeout(() => setShowHint(false), 5000);
    }
  };

  // Don't show if already installed
  if (isStandalone) {
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
        ) : isMobile ? (
          <Smartphone className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>{t('install')}</span>
      </Button>

      {/* Install Hint Tooltip */}
      {showHint && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-50 w-72 text-sm">
          <p className="text-center font-medium mb-2">
            {t('installHint')}
          </p>
          <div className="text-center text-muted-foreground text-xs space-y-1">
            {isIOS ? (
              <p>
                Safari: 공유 버튼 → &quot;홈 화면에 추가&quot;
              </p>
            ) : (
              <>
                <p>Chrome: 메뉴(⋮) → &quot;앱 설치&quot; / &quot;홈 화면에 추가&quot;</p>
                <p>Safari: 공유 → &quot;홈 화면에 추가&quot;</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
