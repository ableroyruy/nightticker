import { useTranslations } from 'next-intl';

interface ComplianceNoticeProps {
  variant?: 'full' | 'compact';
}

export function ComplianceNotice({ variant = 'full' }: ComplianceNoticeProps) {
  const t = useTranslations('compliance');

  if (variant === 'compact') {
    return (
      <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/50 rounded-lg">
        <p className="font-medium">{t('badge')}</p>
        <p>{t('forReference')}</p>
        <p>{t('notOfficial')}</p>
        <p>{t('noReliance')}</p>
      </div>
    );
  }

  return (
    <div className="text-sm text-muted-foreground space-y-2 p-6 bg-muted/50 rounded-lg border">
      <h3 className="font-semibold text-foreground">{t('forReferenceTitle')}</h3>
      <p>{t('fullNotice')}</p>
    </div>
  );
}
