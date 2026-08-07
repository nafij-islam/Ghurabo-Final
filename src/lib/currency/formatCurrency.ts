import { CurrencyCode, LanguageCode } from '@/types';

export const DEFAULT_BDT_PER_USD = Number(process.env.NEXT_PUBLIC_BDT_PER_USD) || 130;

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * Converts English digits (0-9) in a string to Bengali numerals (০-৯)
 */
export function toBengaliNumerals(str: string | number): string {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[0-9]/g, (w) => BENGALI_DIGITS[parseInt(w, 10)]);
}

export interface FormatCurrencyOptions {
  amountBDT: number | null | undefined;
  currency?: CurrencyCode;
  exchangeRate?: number;
  locale?: LanguageCode;
  showDecimals?: boolean;
}

/**
 * Formats a canonical BDT cost value into the selected currency (BDT or USD) and locale (en or bn)
 */
export function formatCurrency({
  amountBDT,
  currency = 'BDT',
  exchangeRate = DEFAULT_BDT_PER_USD,
  locale = 'en',
  showDecimals,
}: FormatCurrencyOptions): string {
  const numericVal = typeof amountBDT === 'number' && !isNaN(amountBDT) ? Math.max(0, amountBDT) : 0;
  const validRate = typeof exchangeRate === 'number' && exchangeRate > 0 ? exchangeRate : DEFAULT_BDT_PER_USD;

  if (currency === 'USD') {
    const amountUSD = numericVal / validRate;
    const decimals = typeof showDecimals === 'number' ? showDecimals : showDecimals === false ? 0 : 2;
    const formattedUSD = amountUSD.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (locale === 'bn') {
      return `$${toBengaliNumerals(formattedUSD)}`;
    }
    return `$${formattedUSD}`;
  }

  // BDT
  const roundedBDT = Math.round(numericVal);
  const formattedBDT = roundedBDT.toLocaleString('en-US');

  if (locale === 'bn') {
    return `৳${toBengaliNumerals(formattedBDT)}`;
  }

  return `৳${formattedBDT}`;
}

/**
 * Converts input cost in any supported currency to normalized BDT for database storage
 */
export function convertToBDT(amount: number, inputCurrency: CurrencyCode = 'BDT', exchangeRate: number = DEFAULT_BDT_PER_USD): number {
  if (typeof amount !== 'number' || isNaN(amount) || amount < 0) return 0;
  const validRate = typeof exchangeRate === 'number' && exchangeRate > 0 ? exchangeRate : DEFAULT_BDT_PER_USD;

  if (inputCurrency === 'USD') {
    return Math.round(amount * validRate);
  }
  return Math.round(amount);
}
