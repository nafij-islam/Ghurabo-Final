'use client';

import React from 'react';
import { usePreferences } from '@/context/PreferencesContext';

interface TripCostDisplayProps {
  amountBDT: number;
  className?: string;
}

export function TripCostDisplay({ amountBDT, className }: TripCostDisplayProps) {
  const { formatCost } = usePreferences();
  return <span className={className}>{formatCost(amountBDT)}</span>;
}

export function TranslatedText({ k, fallback }: { k: any; fallback?: string }) {
  const { t } = usePreferences();
  return <>{t(k, fallback)}</>;
}
