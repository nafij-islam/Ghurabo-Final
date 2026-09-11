/**
 * Platform Settings API Service
 */

import { api } from './apiClient';
import { API_ENDPOINTS } from './apiConfig';
import { BackendSystemSetting, StandardResponse } from './api.types';

export const settingsApi = {
  async getSettings(): Promise<BackendSystemSetting[]> {
    const res = await api.get<StandardResponse<BackendSystemSetting[]>>(API_ENDPOINTS.SETTINGS, {
      skipAuth: true,
    });
    return res.data || [];
  },

  async getSettingByKey(key: string): Promise<BackendSystemSetting | null> {
    try {
      const res = await api.get<StandardResponse<BackendSystemSetting>>(API_ENDPOINTS.SETTING_BY_KEY(key), {
        skipAuth: true,
      });
      return res.data;
    } catch {
      return null;
    }
  },

  async updateCurrencyRate(rate: number, currency = 'USD_TO_BDT_RATE', description?: string): Promise<void> {
    await api.patch(API_ENDPOINTS.ADMIN_SETTINGS_CURRENCY, {
      currency,
      rate,
      description: description || 'Exchange rate 1 USD to Bangladeshi Taka',
    });
  },
};
