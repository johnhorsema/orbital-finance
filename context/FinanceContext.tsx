
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Wallet, Transaction, CurrencyCode, DEFAULT_CATEGORIES, User } from '../types';
import { fetchExchangeRates, RateStatus } from '../services/currencyService';
import { generateOrbitKey } from '../utils/crypto';

interface FinanceContextType {
  user: User | null;
  state: AppState;
  rates: Record<string, number>;
  rateStatus: RateStatus;
  globalCurrency: CurrencyCode;
  
  // Auth Methods
  login: (identifier: string, password?: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<string>; // Returns Orbit Key
  logout: () => void;

  addTransaction: (tx: Omit<Transaction, 'id' | 'convertedAmount' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => void;
  
  addWallet: (wallet: Omit<Wallet, 'id' | 'balance'>) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  
  transferFunds: (sourceId: string, targetId: string, amount: number) => Promise<void>;
  
  addCategory: (category: string) => void;
  deleteCategory: (category: string) => void;
  
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  refreshRates: () => Promise<void>;
  setGlobalCurrency: (c: CurrencyCode) => void;
  switchWallet: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const MOCK_INITIAL_STATE: AppState = {
  wallets: [
    { id: '1', name: 'Main Stash', type: 'FIAT', baseCurrency: 'USD', balance: 1155, color: '#CCFF00' },
    { id: '2', name: 'Euro Trip', type: 'FIAT', baseCurrency: 'EUR', balance: 850, color: '#00F0FF' },
  ],
  transactions: [
    { 
      id: 't1', userId: 'test', walletId: '1', date: '2023-10-24', amount: 1200, currency: 'USD', convertedAmount: 1200, type: 'INCOME', category: 'Salary', description: 'Freelance Gig' 
    },
    { 
      id: 't2', userId: 'test', walletId: '1', date: '2023-10-25', amount: 45, currency: 'USD', convertedAmount: 45, type: 'EXPENSE', category: 'Food', description: 'Sushi' 
    }
  ],
  categories: DEFAULT_CATEGORIES,
};

const EMPTY_STATE: AppState = {
  wallets: [],
  transactions: [],
  categories: DEFAULT_CATEGORIES
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('orbital_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [state, setState] = useState<AppState>(EMPTY_STATE);

  const [globalCurrency, setGlobalCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('orbital_global_currency') as CurrencyCode) || 'USD';
  });
  
  const [rates, setRates] = useState<Record<string, number>>({});
  const [rateStatus, setRateStatus] = useState<RateStatus>({ source: 'primary', lastUpdated: null, base: 'usd' });

  // Seed Demo User
  useEffect(() => {
    const seedDemo = async () => {
        const registryStr = localStorage.getItem('orbital_users_registry');
        const users: User[] = registryStr ? JSON.parse(registryStr) : [];
        
        if (!users.find(u => u.username === 'demo')) {
            const demoPass = 'demo';
            const orbitKey = await generateOrbitKey('demo', demoPass);
            const demoUser: User = {
                id: 'demo-user-id',
                username: 'demo',
                orbitKey
            };
            
            users.push(demoUser);
            localStorage.setItem('orbital_users_registry', JSON.stringify(users));

            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const lastWeek = new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0];

            const seedState: AppState = {
                wallets: [
                    { id: 'w1', name: 'Main Ops', type: 'FIAT', baseCurrency: 'USD', balance: 0, color: '#CCFF00' },
                    { id: 'w2', name: 'Euro Trip', type: 'FIAT', baseCurrency: 'EUR', balance: 0, color: '#00F0FF' },
                    { id: 'w3', name: 'Cold Storage', type: 'CRYPTO', baseCurrency: 'BTC', balance: 0, color: '#FF0099' },
                    { id: 'w4', name: 'Solana Degen', type: 'CRYPTO', baseCurrency: 'SOL', balance: 0, color: '#7000FF' }
                ],
                transactions: [
                    { id: 't1', userId: 'demo-user-id', walletId: 'w1', date: today, amount: 8500, currency: 'USD', convertedAmount: 8500, type: 'INCOME', category: 'Salary', description: 'Monthly Settlement' },
                    { id: 't2', userId: 'demo-user-id', walletId: 'w1', date: yesterday, amount: 120, currency: 'USD', convertedAmount: 120, type: 'EXPENSE', category: 'Tech', description: 'Server Cluster' },
                    { id: 't3', userId: 'demo-user-id', walletId: 'w2', date: lastWeek, amount: 2000, currency: 'EUR', convertedAmount: 2000, type: 'INCOME', category: 'Freelance', description: 'EU Consulting' },
                    { id: 't4', userId: 'demo-user-id', walletId: 'w3', date: lastWeek, amount: 0.45, currency: 'BTC', convertedAmount: 0.45, type: 'INCOME', category: 'Crypto', description: 'Stacking Sats' },
                    { id: 't5', userId: 'demo-user-id', walletId: 'w1', date: today, amount: 15500, currency: 'JPY', convertedAmount: 105, type: 'EXPENSE', category: 'Food', description: 'Tokyo Dinner' },
                    { id: 't6', userId: 'demo-user-id', walletId: 'w4', date: yesterday, amount: 50, currency: 'SOL', convertedAmount: 50, type: 'INCOME', category: 'Crypto', description: 'Airdrop' }
                ],
                categories: DEFAULT_CATEGORIES
            };
            
            localStorage.setItem('orbital_data_demo-user-id', JSON.stringify(seedState));
            console.log("Demo user seeded successfully");
        }
    };
    seedDemo();
  }, []);

  // Recalculate balances helper
  const recalculateBalances = useCallback((transactions: Transaction[], wallets: Wallet[]) => {
      const newWallets = wallets.map(w => ({ ...w, balance: 0 }));
      
      transactions.forEach(tx => {
          const walletIndex = newWallets.findIndex(w => w.id === tx.walletId);
          if (walletIndex > -1) {
              const modifier = tx.type === 'INCOME' ? 1 : -1;
              const amountToAdd = tx.convertedAmount; 
              newWallets[walletIndex].balance += amountToAdd * modifier;
          }
      });
      return newWallets;
  }, []);

  // Load User Data when User changes
  useEffect(() => {
    if (user) {
      const storageKey = `orbital_data_${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (!parsed.categories) parsed.categories = DEFAULT_CATEGORIES;
          // Recalculate on load to ensure integrity
          const updatedWallets = recalculateBalances(parsed.transactions || [], parsed.wallets || []);
          setState({ ...parsed, wallets: updatedWallets });
        } catch (e) {
          console.error("Failed to load user data", e);
          setState(EMPTY_STATE);
        }
      } else {
        // New user gets clean state, no seed data
        setState(EMPTY_STATE);
      }
      localStorage.setItem('orbital_current_user', JSON.stringify(user));
    } else {
      setState(EMPTY_STATE);
      localStorage.removeItem('orbital_current_user');
    }
  }, [user, recalculateBalances]);

  // Persist User Data
  useEffect(() => {
    if (user && state) {
      const storageKey = `orbital_data_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, user]);

  useEffect(() => {
    localStorage.setItem('orbital_global_currency', globalCurrency);
  }, [globalCurrency]);

  // Auth Functions
  const getUsersRegistry = (): User[] => {
    const reg = localStorage.getItem('orbital_users_registry');
    return reg ? JSON.parse(reg) : [];
  };

  const login = async (identifier: string, password?: string): Promise<boolean> => {
    const registry = getUsersRegistry();
    let foundUser: User | undefined;

    if (password) {
      // Username + Password Login
      const derivedKey = await generateOrbitKey(identifier, password);
      foundUser = registry.find(u => u.orbitKey === derivedKey);
    } else {
      // Orbit Key Login
      foundUser = registry.find(u => u.orbitKey === identifier);
    }

    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string): Promise<string> => {
    const registry = getUsersRegistry();
    
    const orbitKey = await generateOrbitKey(username, password);
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      orbitKey
    };

    registry.push(newUser);
    localStorage.setItem('orbital_users_registry', JSON.stringify(registry));
    
    // NOTE: Removed auto-login to allow user to download key on landing page first.
    return orbitKey;
  };

  const logout = () => {
    setUser(null);
  };

  const refreshRates = useCallback(async () => {
    const result = await fetchExchangeRates(globalCurrency);
    if (result.status.source !== 'error') {
      setRates(result.rates);
      setRateStatus(result.status);
    } else {
      setRateStatus(result.status);
    }
  }, [globalCurrency]);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  const addTransaction = async (tx: Omit<Transaction, 'id' | 'convertedAmount' | 'userId'>) => {
    if (!user) return;
    const wallet = state.wallets.find(w => w.id === tx.walletId);
    if (!wallet) return;

    let convertedAmount = tx.amount;
    
    if (tx.currency !== wallet.baseCurrency) {
        const rateData = await fetchExchangeRates(tx.currency);
        const rate = rateData.rates[wallet.baseCurrency.toLowerCase()];
        if (rate) {
            convertedAmount = tx.amount * rate;
        }
    }

    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      userId: user.id,
      convertedAmount
    };

    setState(prev => {
        const newTransactions = [newTx, ...prev.transactions];
        const updatedWallets = recalculateBalances(newTransactions, prev.wallets);

        return {
            ...prev,
            transactions: newTransactions,
            wallets: updatedWallets
        };
    });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const oldTx = state.transactions.find(t => t.id === id);
    if (!oldTx) return;
    
    const wallet = state.wallets.find(w => w.id === (updates.walletId || oldTx.walletId));
    if (!wallet) return;

    let convertedAmount = updates.convertedAmount ?? oldTx.convertedAmount;

    const needsReconversion = 
        (updates.amount !== undefined && updates.amount !== oldTx.amount) ||
        (updates.currency !== undefined && updates.currency !== oldTx.currency) ||
        (updates.walletId !== undefined && updates.walletId !== oldTx.walletId);

    if (needsReconversion) {
        const amount = updates.amount ?? oldTx.amount;
        const currency = updates.currency ?? oldTx.currency;
        
        if (currency === wallet.baseCurrency) {
            convertedAmount = amount;
        } else {
            const rateData = await fetchExchangeRates(currency);
            const rate = rateData.rates[wallet.baseCurrency.toLowerCase()];
            if (rate) {
                convertedAmount = amount * rate;
            }
        }
    }

    setState(prev => {
        const newTransactions = prev.transactions.map(t => 
            t.id === id ? { ...t, ...updates, convertedAmount } : t
        );
        const updatedWallets = recalculateBalances(newTransactions, prev.wallets);
        return { ...prev, transactions: newTransactions, wallets: updatedWallets };
    });
  };

  const deleteTransaction = (id: string) => {
      setState(prev => {
          const newTransactions = prev.transactions.filter(t => t.id !== id);
          const updatedWallets = recalculateBalances(newTransactions, prev.wallets);
          return { ...prev, transactions: newTransactions, wallets: updatedWallets };
      });
  };

  const transferFunds = async (sourceId: string, targetId: string, amount: number) => {
    if (!user) return;
    const sourceWallet = state.wallets.find(w => w.id === sourceId);
    const targetWallet = state.wallets.find(w => w.id === targetId);
    
    if (!sourceWallet || !targetWallet) return;

    let targetAmount = amount; 
    
    if (sourceWallet.baseCurrency !== targetWallet.baseCurrency) {
         const rateData = await fetchExchangeRates(sourceWallet.baseCurrency);
         const rate = rateData.rates[targetWallet.baseCurrency.toLowerCase()];
         if (rate) {
             targetAmount = amount * rate;
         } else {
             console.error("Could not fetch conversion rate for transfer");
             return; 
         }
    }

    const date = new Date().toISOString().split('T')[0];

    const txOut: Transaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        walletId: sourceId,
        date,
        amount: amount,
        currency: sourceWallet.baseCurrency,
        convertedAmount: amount,
        type: 'EXPENSE',
        category: 'Transfer',
        description: `Transfer to ${targetWallet.name}`
    };

    const txIn: Transaction = {
        id: crypto.randomUUID(),
        userId: user.id,
        walletId: targetId,
        date,
        amount: targetAmount,
        currency: targetWallet.baseCurrency,
        convertedAmount: targetAmount, 
        type: 'INCOME',
        category: 'Transfer',
        description: `Transfer from ${sourceWallet.name}`
    };

    setState(prev => {
        const newTransactions = [txIn, txOut, ...prev.transactions];
        const updatedWallets = recalculateBalances(newTransactions, prev.wallets);
        return { ...prev, transactions: newTransactions, wallets: updatedWallets };
    });
  };

  const addWallet = (walletData: Omit<Wallet, 'id' | 'balance'>) => {
      const newWallet: Wallet = {
          ...walletData,
          id: crypto.randomUUID(),
          balance: 0
      };
      setState(prev => ({ ...prev, wallets: [...prev.wallets, newWallet] }));
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
      setState(prev => ({
          ...prev,
          wallets: prev.wallets.map(w => w.id === id ? { ...w, ...updates } : w)
      }));
  };

  const deleteWallet = (id: string) => {
      setState(prev => ({
          ...prev,
          wallets: prev.wallets.filter(w => w.id !== id),
          transactions: prev.transactions.filter(t => t.walletId !== id)
      }));
  };

  const addCategory = (category: string) => {
      if (!state.categories.includes(category)) {
          setState(prev => ({ ...prev, categories: [...prev.categories, category] }));
      }
  };

  const deleteCategory = (category: string) => {
      setState(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
  };

  const importData = (jsonData: string): boolean => {
      try {
          const parsed = JSON.parse(jsonData);
          if (parsed.wallets && parsed.transactions) {
              if (!parsed.categories) parsed.categories = DEFAULT_CATEGORIES;
              setState(parsed);
              return true;
          }
          return false;
      } catch (e) {
          return false;
      }
  };

  const exportData = () => JSON.stringify(state, null, 2);

  return (
    <FinanceContext.Provider value={{
      user,
      state,
      rates,
      rateStatus,
      globalCurrency,
      login,
      signup,
      logout,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addWallet,
      updateWallet,
      deleteWallet,
      transferFunds,
      addCategory,
      deleteCategory,
      importData,
      exportData,
      refreshRates,
      setGlobalCurrency,
      switchWallet: () => {} 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within FinanceProvider");
  return context;
};
