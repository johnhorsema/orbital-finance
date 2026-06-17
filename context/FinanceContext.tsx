
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Wallet, Transaction, CurrencyCode, DEFAULT_CATEGORIES, User, ThemeMode, RecurringTransaction, RecurrenceFrequency } from '../types';
import { fetchExchangeRates, RateStatus } from '../services/currencyService';
import { generateOrbitKey } from '../utils/crypto';
import { generatePalette } from '../utils/themeGenerator';
import { useActivityLog } from './ActivityLogContext';

interface FinanceContextType {
  user: User | null;
  state: AppState;
  rates: Record<string, number>;
  previousRates: Record<string, number>;
  rateStatus: RateStatus;
  globalCurrency: CurrencyCode;
  primaryColor: string;
  themeMode: ThemeMode;
  
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

  // Recurring
  addRecurringTransaction: (rt: Omit<RecurringTransaction, 'id' | 'userId' | 'active' | 'lastRunDate'>) => void;
  deleteRecurringTransaction: (id: string) => void;
  toggleRecurringTransaction: (id: string) => void;
  
  importData: (jsonData: string) => boolean;
  exportData: () => string;
  refreshRates: () => Promise<void>;
  setGlobalCurrency: (c: CurrencyCode) => void;
  setPrimaryColor: (color: string) => void;
  toggleTheme: () => void;
  switchWallet: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const MOCK_INITIAL_STATE: AppState = {
  wallets: [],
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  recurring: []
};

const EMPTY_STATE: AppState = {
  wallets: [],
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  recurring: []
};

// Helper to calculate next date
const calculateNextDate = (currentDate: string, frequency: RecurrenceFrequency): string => {
    const d = new Date(currentDate);
    switch (frequency) {
        case 'DAILY': d.setDate(d.getDate() + 1); break;
        case 'WEEKLY': d.setDate(d.getDate() + 7); break;
        case 'MONTHLY': d.setMonth(d.getMonth() + 1); break;
        case 'YEARLY': d.setFullYear(d.getFullYear() + 1); break;
    }
    return d.toISOString().split('T')[0];
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logActivity } = useActivityLog();
  
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('orbital_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [state, setState] = useState<AppState>(EMPTY_STATE);

  const [globalCurrency, setGlobalCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('orbital_global_currency') as CurrencyCode) || 'USD';
  });

  const [primaryColor, setPrimaryColor] = useState<string>(() => {
      return localStorage.getItem('orbital_primary_color') || '#3B82F6'; // Electric Blue
  });

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('orbital_theme_mode') as ThemeMode) || 'dark';
  });
  
  const [rates, setRates] = useState<Record<string, number>>({});
  const [previousRates, setPreviousRates] = useState<Record<string, number>>({});
  const [rateStatus, setRateStatus] = useState<RateStatus>({ source: 'primary', lastUpdated: null, base: 'usd' });

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Apply Dynamic Theme Side Effect
  useEffect(() => {
    localStorage.setItem('orbital_primary_color', primaryColor);
    localStorage.setItem('orbital_theme_mode', themeMode);
    
    // Generate palette from primary color and mode
    const palette = generatePalette(primaryColor, themeMode);
    const root = document.documentElement;

    // Background colors
    root.style.setProperty('--color-bg-primary', palette.bgPrimary);
    root.style.setProperty('--color-bg-surface', palette.bgSurface);
    root.style.setProperty('--color-bg-surface-highlight', palette.bgSurfaceHighlight);
    root.style.setProperty('--color-bg-subtle', palette.bgSubtle);
    
    // Text colors
    root.style.setProperty('--color-text-primary', palette.textPrimary);
    root.style.setProperty('--color-text-secondary', palette.textSecondary);
    root.style.setProperty('--color-text-tertiary', palette.textTertiary);
    
    // Accent colors
    root.style.setProperty('--color-accent', palette.accent);
    root.style.setProperty('--color-accent-hover', palette.accentHover);
    root.style.setProperty('--color-accent-subtle', palette.accentSubtle);
    
    // Semantic colors
    root.style.setProperty('--color-positive', palette.positive);
    root.style.setProperty('--color-negative', palette.negative);
    root.style.setProperty('--color-warning', palette.warning);
    
    // Border colors
    root.style.setProperty('--color-border', palette.border);
    root.style.setProperty('--color-border-strong', palette.borderStrong);
    
  }, [primaryColor, themeMode]);

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

  // Automation Engine for Recurring Transactions
  const processRecurringTransactions = useCallback(async (currentState: AppState, currentUser: User): Promise<AppState | null> => {
      if (!currentState.recurring || currentState.recurring.length === 0) return null;

      const today = new Date().toISOString().split('T')[0];
      const newTransactions: Transaction[] = [];
      let stateChanged = false;

      const updatedRecurring = currentState.recurring.map(rule => {
          if (!rule.active) return rule;
          
          let nextDue = rule.nextDueDate;
          let modifiedRule = { ...rule };
          let ruleTriggered = false;

          // Process all overdue occurrences (catch-up logic)
          // Limit to 12 iterations to prevent infinite loops on bad data
          let iterations = 0;
          while (nextDue <= today && iterations < 12) {
              ruleTriggered = true;
              stateChanged = true;
              
              // Create Transaction
              // Note: We need exchange rates here. 
              // For simplicity in this sync pass, we assume exact amount if same currency, 
              // or basic 1:1 if we can't fetch. 
              // ideally we use the cached 'rates' but that's in state. 
              // Since this is automated, we'll try to find wallet currency match.
              
              const wallet = currentState.wallets.find(w => w.id === rule.walletId);
              let convertedAmount = rule.amount; // fallback
              
              // Simplification: In automation, if currencies differ, we might not have perfect rate
              // We will rely on later updates or assume logic holds.
              // To fix this properly, we should fetch rates, but we want this synchronous-ish.
              // We'll leave convertedAmount = amount if mismatch, effectively 1:1 fallback for automation
              // The user can edit the auto-generated tx later if needed.
              
              const newTx: Transaction = {
                  id: crypto.randomUUID(),
                  userId: currentUser.id,
                  walletId: rule.walletId,
                  date: nextDue, // Date is the due date
                  amount: rule.amount,
                  currency: rule.currency,
                  convertedAmount: convertedAmount, // Needs refinement in real app
                  type: rule.type,
                  category: rule.category,
                  description: `${rule.description} (Recurring)`,
              };
              
              newTransactions.push(newTx);
              
              // Advance Date
              nextDue = calculateNextDate(nextDue, rule.frequency);
              iterations++;
          }

          if (ruleTriggered) {
              modifiedRule.nextDueDate = nextDue;
              modifiedRule.lastRunDate = today;
          }

          return modifiedRule;
      });

      if (!stateChanged) return null;

      // Batch fetch rates if needed to correct convertedAmounts? 
      // For now, let's just apply the transactions.
      // Re-calculate balances
      const allTransactions = [...newTransactions, ...currentState.transactions];
      const updatedWallets = recalculateBalances(allTransactions, currentState.wallets);

      return {
          ...currentState,
          transactions: allTransactions,
          wallets: updatedWallets,
          recurring: updatedRecurring
      };

  }, [recalculateBalances]);

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
                    { id: 'w1', name: 'Main Ops', type: 'FIAT', baseCurrency: 'USD', balance: 0, color: '#3B82F6' },
                    { id: 'w2', name: 'Euro Trip', type: 'FIAT', baseCurrency: 'EUR', balance: 0, color: '#10B981' },
                    { id: 'w3', name: 'Cold Storage', type: 'CRYPTO', baseCurrency: 'BTC', balance: 0, color: '#F59E0B' },
                    { id: 'w4', name: 'Solana Degen', type: 'CRYPTO', baseCurrency: 'SOL', balance: 0, color: '#06B6D4' }
                ],
                transactions: [
                    { id: 't1', userId: 'demo-user-id', walletId: 'w1', date: today, amount: 8500, currency: 'USD', convertedAmount: 8500, type: 'INCOME', category: 'Salary', description: 'Monthly Settlement' },
                    { id: 't2', userId: 'demo-user-id', walletId: 'w1', date: yesterday, amount: 120, currency: 'USD', convertedAmount: 120, type: 'EXPENSE', category: 'Tech', description: 'Server Cluster' },
                    { id: 't3', userId: 'demo-user-id', walletId: 'w2', date: lastWeek, amount: 2000, currency: 'EUR', convertedAmount: 2000, type: 'INCOME', category: 'Freelance', description: 'EU Consulting' },
                    { id: 't4', userId: 'demo-user-id', walletId: 'w3', date: lastWeek, amount: 0.45, currency: 'BTC', convertedAmount: 0.45, type: 'INCOME', category: 'Crypto', description: 'Stacking Sats' },
                    { id: 't5', userId: 'demo-user-id', walletId: 'w1', date: today, amount: 15500, currency: 'JPY', convertedAmount: 105, type: 'EXPENSE', category: 'Food', description: 'Tokyo Dinner' },
                    { id: 't6', userId: 'demo-user-id', walletId: 'w4', date: yesterday, amount: 50, currency: 'SOL', convertedAmount: 50, type: 'INCOME', category: 'Crypto', description: 'Airdrop' }
                ],
                categories: DEFAULT_CATEGORIES,
                recurring: [
                    { id: 'r1', userId: 'demo-user-id', walletId: 'w1', amount: 1200, currency: 'USD', type: 'EXPENSE', category: 'Housing', description: 'Orbital Station Rent', frequency: 'MONTHLY', startDate: today, nextDueDate: calculateNextDate(today, 'MONTHLY'), active: true }
                ]
            };
            
            localStorage.setItem('orbital_data_demo-user-id', JSON.stringify(seedState));
            console.log("Demo user seeded successfully");
        }
    };
    seedDemo();
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
          if (!parsed.recurring) parsed.recurring = [];
          
          // Initial calculation
          const updatedWallets = recalculateBalances(parsed.transactions || [], parsed.wallets || []);
          let loadedState = { ...parsed, wallets: updatedWallets };
          
          setState(loadedState);

          // Run Automation immediately after load
          processRecurringTransactions(loadedState, user).then(newState => {
              if (newState) {
                  setState(newState);
                  console.log("Processed recurring transactions");
              }
          });

        } catch (e) {
          console.error("Failed to load user data", e);
          setState(EMPTY_STATE);
        }
      } else {
        setState(EMPTY_STATE);
      }
      localStorage.setItem('orbital_current_user', JSON.stringify(user));
    } else {
      setState(EMPTY_STATE);
      localStorage.removeItem('orbital_current_user');
    }
  }, [user, recalculateBalances, processRecurringTransactions]);

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
      const derivedKey = await generateOrbitKey(identifier, password);
      foundUser = registry.find(u => u.orbitKey === derivedKey);
    } else {
      foundUser = registry.find(u => u.orbitKey === identifier);
    }

    if (foundUser) {
      setUser(foundUser);
      logActivity('LOGIN', `User '${foundUser.username}' logged in`);
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
    return orbitKey;
  };

  const logout = () => {
    if (user) {
      logActivity('LOGOUT', `User '${user.username}' logged out`);
    }
    setUser(null);
  };

  const refreshRates = useCallback(async () => {
    // Store current rates as previous before fetching new ones
    setPreviousRates(currentRates => ({ ...currentRates }));
    
    const result = await fetchExchangeRates(globalCurrency, true); // Force refresh to bypass cache
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
        
        logActivity('TRANSACTION_CREATE', `Added ${tx.type.toLowerCase()} transaction: ${tx.description}`, `${tx.amount} ${tx.currency}`, tx.walletId);

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
      const tx = state.transactions.find(t => t.id === id);
      setState(prev => {
          const newTransactions = prev.transactions.filter(t => t.id !== id);
          const updatedWallets = recalculateBalances(newTransactions, prev.wallets);
          return { ...prev, transactions: newTransactions, wallets: updatedWallets };
      });
      if (tx) {
          logActivity('TRANSACTION_DELETE', `Deleted transaction: ${tx.description}`, `${tx.amount} ${tx.currency}`);
      }
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
         if (rate) targetAmount = amount * rate;
         else return; 
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

  // --- RECURRING TRANSACTIONS CRUD ---

  const addRecurringTransaction = (rt: Omit<RecurringTransaction, 'id' | 'userId' | 'active' | 'lastRunDate'>) => {
      if (!user) return;
      const newRule: RecurringTransaction = {
          ...rt,
          id: crypto.randomUUID(),
          userId: user.id,
          active: true
      };
      setState(prev => ({
          ...prev,
          recurring: [...(prev.recurring || []), newRule]
      }));
      logActivity('TRANSACTION_CREATE', `Created recurring transaction: ${rt.description}`, `${rt.frequency} - ${rt.amount} ${rt.currency}`);
  };

  const deleteRecurringTransaction = (id: string) => {
      const rule = state.recurring.find(r => r.id === id);
      setState(prev => ({
          ...prev,
          recurring: prev.recurring.filter(r => r.id !== id)
      }));
      if (rule) {
          logActivity('TRANSACTION_DELETE', `Deleted recurring transaction: ${rule.description}`);
      }
  };

  const toggleRecurringTransaction = (id: string) => {
      const rule = state.recurring.find(r => r.id === id);
      setState(prev => ({
          ...prev,
          recurring: prev.recurring.map(r => r.id === id ? { ...r, active: !r.active } : r)
      }));
      if (rule) {
          logActivity('SETTINGS_CHANGE', `${rule.active ? 'Disabled' : 'Enabled'} recurring: ${rule.description}`);
      }
  };

  // --- WALLET / CAT CRUD ---

  const addWallet = (walletData: Omit<Wallet, 'id' | 'balance'>) => {
      const newWallet: Wallet = {
          ...walletData,
          id: crypto.randomUUID(),
          balance: 0
      };
      setState(prev => ({ ...prev, wallets: [...prev.wallets, newWallet] }));
      logActivity('WALLET_SWITCH', `Created wallet: ${walletData.name}`, `${walletData.type} - ${walletData.baseCurrency}`);
  };

  const updateWallet = (id: string, updates: Partial<Wallet>) => {
      setState(prev => ({
          ...prev,
          wallets: prev.wallets.map(w => w.id === id ? { ...w, ...updates } : w)
      }));
  };

  const deleteWallet = (id: string) => {
      const wallet = state.wallets.find(w => w.id === id);
      setState(prev => ({
          ...prev,
          wallets: prev.wallets.filter(w => w.id !== id),
          transactions: prev.transactions.filter(t => t.walletId !== id),
          recurring: prev.recurring.filter(r => r.walletId !== id)
      }));
      if (wallet) {
          logActivity('WALLET_SWITCH', `Deleted wallet: ${wallet.name}`, `${wallet.type} - ${wallet.baseCurrency}`);
      }
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
              if (!parsed.recurring) parsed.recurring = [];
              setState(parsed);
              logActivity('DATA_EXPORT', 'Imported data from JSON file');
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
      previousRates,
      rateStatus,
      globalCurrency,
      primaryColor,
      themeMode,
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
      addRecurringTransaction,
      deleteRecurringTransaction,
      toggleRecurringTransaction,
      importData,
      exportData,
      refreshRates,
      setGlobalCurrency,
      setPrimaryColor,
      toggleTheme,
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
