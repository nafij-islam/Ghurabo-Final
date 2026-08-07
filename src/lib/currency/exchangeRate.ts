import { connectToDatabase } from '@/lib/db/mongodb';
import { SystemConfigModel } from '@/lib/db/models';
import { DEFAULT_BDT_PER_USD } from './formatCurrency';

let inMemoryRate = DEFAULT_BDT_PER_USD;
let inMemoryMode: 'automatic' | 'manual' = 'manual';
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour server-side cache

export async function getExchangeRate(): Promise<{ rate: number; mode: 'automatic' | 'manual' }> {
  const now = Date.now();

  // Return cached in-memory rate if fresh
  if (now - lastFetchTimestamp < CACHE_TTL_MS) {
    return { rate: inMemoryRate, mode: inMemoryMode };
  }

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const config = (await SystemConfigModel.findOne({ key: 'main_config' }).lean()) as any;
      if (config) {
        if (config.exchangeRateUSDToBDT && typeof config.exchangeRateUSDToBDT === 'number') {
          inMemoryRate = config.exchangeRateUSDToBDT;
        }
        if (config.exchangeRateMode) {
          inMemoryMode = config.exchangeRateMode;
        }
        lastFetchTimestamp = now;
        return { rate: inMemoryRate, mode: inMemoryMode };
      }
    }
  } catch (err) {
    console.warn('Exchange Rate fetch failed, using fallback:', err);
  }

  return { rate: DEFAULT_BDT_PER_USD, mode: 'manual' };
}

export async function updateExchangeRate(rate: number, mode: 'automatic' | 'manual'): Promise<boolean> {
  if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) return false;

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await SystemConfigModel.findOneAndUpdate(
        { key: 'main_config' },
        {
          $set: {
            exchangeRateUSDToBDT: rate,
            exchangeRateMode: mode,
            lastFetchedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      inMemoryRate = rate;
      inMemoryMode = mode;
      lastFetchTimestamp = Date.now();
      return true;
    }
  } catch (err) {
    console.error('Failed to update exchange rate in Mongo Atlas:', err);
  }
  return false;
}
