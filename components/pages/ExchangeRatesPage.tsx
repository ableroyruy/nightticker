'use client';

import { useLocale, useTranslations } from 'next-intl';
import { RefreshCw, TrendingUp, TrendingDown, Clock, Info } from 'lucide-react';
import { useCurrency } from '@/lib/context/CurrencyContext';
import {
  currencies,
  currencyList,
  CurrencyCode,
  getCurrencyName,
} from '@/lib/constants/currencies';
import { ComplianceNotice } from '@/components/common/ComplianceNotice';
import { cn } from '@/lib/utils';

function ExchangeRateCard({ code }: { code: CurrencyCode }) {
  const locale = useLocale();
  const t = useTranslations('exchangeRate');
  const { rates, currency, setCurrency } = useCurrency();

  const info = currencies[code];
  const rateData = rates.find((r) => r.currency === code);
  const rate = rateData?.rate ?? 0;
  const change = rateData?.change ?? null;
  const changePercent = rateData?.changePercent ?? null;

  const isPositive = changePercent !== null && changePercent >= 0;
  const hasChange = changePercent !== null;
  const isSelected = code === currency;

  // Format rate
  const formattedRate =
    info.decimals === 0
      ? rate.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : rate.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        });

  return (
    <button
      onClick={() => setCurrency(code)}
      className={cn(
        'glass-card glass-card-hover rounded-2xl p-5 text-left w-full transition-all',
        isSelected && 'ring-2 ring-primary border-primary/50'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{info.flag}</span>
          <div>
            <div className="font-semibold text-lg">{code}</div>
            <div className="text-sm text-muted-foreground">
              {getCurrencyName(code, locale)}
            </div>
          </div>
        </div>
        {isSelected && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
            {t('selected')}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">1 USD =</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono">
            {info.symbol}
            {formattedRate}
          </span>
        </div>

        {hasChange && (
          <div
            className={cn(
              'flex items-center gap-2 text-sm font-medium',
              isPositive ? 'text-gain' : 'text-loss'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {changePercent?.toFixed(2)}%
            </span>
            <span className="text-muted-foreground text-xs">({t('vs24h')})</span>
          </div>
        )}
      </div>
    </button>
  );
}

export function ExchangeRatesPage() {
  const t = useTranslations('exchangeRate');
  const { lastUpdated, isLoading } = useCurrency();

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {t('lastUpdated')}: {formatTime(lastUpdated)}
            </span>
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="glass-card rounded-xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>{t('selectCurrencyHint')}</p>
          </div>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencyList.map((code) => (
            <ExchangeRateCard key={code} code={code} />
          ))}
        </div>

        {/* Disclaimer */}
        <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">{t('disclaimer')}</p>
          <p>{t('disclaimerContent')}</p>
        </div>

        {/* Compliance Notice */}
        <ComplianceNotice />
      </div>
    </div>
  );
}
