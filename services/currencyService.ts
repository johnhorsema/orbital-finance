import { CurrencyCode, ExchangeRateResponse } from '../types';

const BASE_URL_PRIMARY = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1';
const BASE_URL_FALLBACK = 'https://latest.currency-api.pages.dev/v1';

// Cache to prevent spamming the API
const rateCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export interface RateStatus {
  source: 'primary' | 'fallback' | 'cache' | 'error';
  lastUpdated: Date | null;
  error?: string;
  base: string;
}

/**
 * Fetches exchange rates for a specific base currency.
 * Note: The free API usually provides rates relative to a specific base or lists all currencies.
 * The endpoint structure is /currencies/{currencyCode}.json
 */
export const fetchExchangeRates = async (base: string): Promise<{ rates: Record<string, number>; status: RateStatus }> => {
  const normalizedBase = base.toLowerCase();
  
  // Check Cache
  if (rateCache[normalizedBase]) {
    const { data, timestamp } = rateCache[normalizedBase];
    if (Date.now() - timestamp < CACHE_DURATION) {
      return { 
        rates: data, 
        status: { source: 'cache', lastUpdated: new Date(timestamp), base } 
      };
    }
  }

  const endpoint = `/currencies/${normalizedBase}.json`;
  
  try {
    // Try Primary (JSDelivr)
    console.log(`Fetching from primary: ${BASE_URL_PRIMARY}${endpoint}`);
    const response = await fetch(`${BASE_URL_PRIMARY}${endpoint}`);
    
    if (!response.ok) throw new Error(`Primary failed: ${response.statusText}`);
    
    const json = await response.json();
    // The API returns structure like: { date: "...", eur: { ...rates } }
    const rates = json[normalizedBase];
    
    rateCache[normalizedBase] = { data: rates, timestamp: Date.now() };

    return { 
      rates, 
      status: { source: 'primary', lastUpdated: new Date(), base } 
    };

  } catch (primaryError) {
    console.warn("Primary API failed, switching to fallback...", primaryError);

    try {
      // Try Fallback (Pages.dev)
      const response = await fetch(`${BASE_URL_FALLBACK}${endpoint}`);
      if (!response.ok) throw new Error(`Fallback failed: ${response.statusText}`);
      
      const json = await response.json();
      const rates = json[normalizedBase];

      rateCache[normalizedBase] = { data: rates, timestamp: Date.now() };

      return { 
        rates, 
        status: { source: 'fallback', lastUpdated: new Date(), base } 
      };

    } catch (fallbackError) {
      console.error("All currency API sources failed", fallbackError);
      return { 
        rates: {}, 
        status: { source: 'error', lastUpdated: null, error: 'Failed to fetch rates', base } 
      };
    }
  }
};

export const getAllCurrencies = async (): Promise<Record<string, string>> => {
    try {
        const response = await fetch(`${BASE_URL_PRIMARY}/currencies.json`);
        return await response.json();
    } catch (e) {
        const response = await fetch(`${BASE_URL_FALLBACK}/currencies.json`);
        return await response.json();
    }
}