import { useTranslations } from 'next-intl';

export function ReferralDisclosure() {
  const t = useTranslations('compliance');

  return (
    <p className="text-xs text-muted-foreground italic">
      {t('referralDisclosure')}
    </p>
  );
}
