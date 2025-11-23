

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'HKD' | 'SGD' | 'KRW' | 'THB' | 'IDR' | 'BTC' | 'ETH' | 'SOL';

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

export interface User {
  id: string;
  username: string;
  orbitKey: string;
}

export interface AppState {
  wallets: Wallet[];
  transactions: Transaction[];
  categories: string[];
}

export const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'HKD', 'SGD', 'KRW', 'THB', 'IDR', 'BTC', 'ETH', 'SOL'];

export const DEFAULT_CATEGORIES = [
  'Travel', 'Food', 'Housing', 'Tech', 'Crypto', 'Freelance', 'Salary', 'Transport', 'Utilities', 'Entertainment', 'Transfer'
];