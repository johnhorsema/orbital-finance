

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'HKD' | 'SGD' | 'KRW' | 'THB' | 'IDR' | 'BTC' | 'ETH' | 'SOL';

export type ThemeMode = 'light' | 'dark';

export interface ExchangeRateResponse {
  date: string;
  [key: string]: any; // Dynamic currency keys
}

export interface Wallet {
  id: string;
  name: string;
  type: 'FIAT' | 'CRYPTO';
  baseCurrency: CurrencyCode;
  balance: number; // Stored in baseCurrency
  color: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  userId: string; // Linked to User
  walletId: string;
  date: string;
  amount: number; // The amount in the transaction currency
  currency: CurrencyCode; 
  convertedAmount: number; // Value in wallet's base currency at time of transaction
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  currency: CurrencyCode;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextDueDate: string;
  active: boolean;
  lastRunDate?: string;
}

export interface User {
  id: string;
  username: string;
  orbitKey: string;
}

export interface AppState {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: string[];
  recurring: RecurringTransaction[];
}

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'HKD', 'SGD', 'KRW', 'THB', 'IDR', 'BTC', 'ETH', 'SOL'];

export const DEFAULT_CATEGORIES = [
  'Travel', 'Food', 'Housing', 'Tech', 'Crypto', 'Freelance', 'Salary', 'Transport', 'Utilities', 'Entertainment', 'Transfer', 'Subscription'
];

// --- Theme Definitions ---

export const PRESET_COLORS = [
  { label: 'Electric Blue', value: '#3B82F6' },
  { label: 'Indigo', value: '#6366F1' },
  { label: 'Violet', value: '#8B5CF6' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Slate', value: '#64748B' },
];