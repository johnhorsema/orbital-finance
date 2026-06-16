import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Button } from '../components/ui/Button';
import { Download, Upload, Check, AlertCircle, Plus, X, Globe, Palette, Pipette, Sun, Moon, Sparkles, Wallet, ArrowRightLeft, Repeat } from 'lucide-react';
import { SUPPORTED_CURRENCIES, PRESET_COLORS } from '../types';

const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export const Settings: React.FC = () => {
  const { exportData, importData, state, addCategory, deleteCategory, globalCurrency, setGlobalCurrency, primaryColor, setPrimaryColor, themeMode, toggleTheme } = useFinance();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [jsonInput, setJsonInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCopyExport = () => {
    const data = exportData();
    navigator.clipboard.writeText(data);
  };

  const generateSampleData = (type: 'personal' | 'business' | 'crypto') => {
    const now = new Date();
    const wallets = [];
    const transactions = [];
    let txId = 1;

    if (type === 'personal') {
      wallets.push(
        { id: 'w1', name: 'Main Checking', type: 'FIAT', baseCurrency: 'USD', balance: 5420.50, color: '#3B82F6' },
        { id: 'w2', name: 'Savings', type: 'FIAT', baseCurrency: 'USD', balance: 12500.00, color: '#10B981' },
        { id: 'w3', name: 'Bitcoin Wallet', type: 'CRYPTO', baseCurrency: 'BTC', balance: 0.15, color: '#F59E0B' }
      );

      const personalTx = [
        { walletId: 'w1', amount: 4500, currency: 'USD', type: 'INCOME', category: 'Salary', description: 'Monthly salary' },
        { walletId: 'w1', amount: -1200, currency: 'USD', type: 'EXPENSE', category: 'Housing', description: 'Rent payment' },
        { walletId: 'w1', amount: -85.50, currency: 'USD', type: 'EXPENSE', category: 'Food', description: 'Grocery shopping' },
        { walletId: 'w1', amount: -45, currency: 'USD', type: 'EXPENSE', category: 'Transport', description: 'Gas station' },
        { walletId: 'w1', amount: -15.99, currency: 'USD', type: 'EXPENSE', category: 'Subscription', description: 'Netflix' },
        { walletId: 'w1', amount: -120, currency: 'USD', type: 'EXPENSE', category: 'Utilities', description: 'Electric bill' },
        { walletId: 'w1', amount: -250, currency: 'USD', type: 'EXPENSE', category: 'Tech', description: 'New keyboard' },
        { walletId: 'w2', amount: -2000, currency: 'USD', type: 'EXPENSE', category: 'Transfer', description: 'Transfer to savings' },
        { walletId: 'w3', amount: 0.05, currency: 'BTC', type: 'INCOME', category: 'Crypto', description: 'BTC purchase' },
        { walletId: 'w1', amount: -65, currency: 'USD', type: 'EXPENSE', category: 'Entertainment', description: 'Concert tickets' },
        { walletId: 'w1', amount: -42, currency: 'USD', type: 'EXPENSE', category: 'Food', description: 'Restaurant dinner' },
        { walletId: 'w1', amount: 350, currency: 'USD', type: 'INCOME', category: 'Freelance', description: 'Design project' },
      ];

      personalTx.forEach((tx, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 3));
        transactions.push({
          id: `tx${txId++}`,
          userId: 'user1',
          walletId: tx.walletId,
          date: date.toISOString().split('T')[0],
          amount: Math.abs(tx.amount),
          currency: tx.currency,
          convertedAmount: Math.abs(tx.amount),
          type: tx.type,
          category: tx.category,
          description: tx.description
        });
      });
    } else if (type === 'business') {
      wallets.push(
        { id: 'w1', name: 'Business USD', type: 'FIAT', baseCurrency: 'USD', balance: 28450.00, color: '#6366F1' },
        { id: 'w2', name: 'Business EUR', type: 'FIAT', baseCurrency: 'EUR', balance: 15200.00, color: '#8B5CF6' },
        { id: 'w3', name: 'Crypto Treasury', type: 'CRYPTO', baseCurrency: 'ETH', balance: 2.5, color: '#06B6D4' }
      );

      const businessTx = [
        { walletId: 'w1', amount: 15000, currency: 'USD', type: 'INCOME', category: 'Freelance', description: 'Client payment - Project A' },
        { walletId: 'w2', amount: 8500, currency: 'EUR', type: 'INCOME', category: 'Freelance', description: 'EU client invoice' },
        { walletId: 'w1', amount: -2500, currency: 'USD', type: 'EXPENSE', category: 'Tech', description: 'Server hosting (AWS)' },
        { walletId: 'w1', amount: -150, currency: 'USD', type: 'EXPENSE', category: 'Subscription', description: 'Software licenses' },
        { walletId: 'w1', amount: -800, currency: 'USD', type: 'EXPENSE', category: 'Housing', description: 'Office rent' },
        { walletId: 'w1', amount: -320, currency: 'USD', type: 'EXPENSE', category: 'Transport', description: 'Business travel' },
        { walletId: 'w2', amount: -1200, currency: 'EUR', type: 'EXPENSE', category: 'Tech', description: 'Equipment purchase' },
        { walletId: 'w3', amount: 1.2, currency: 'ETH', type: 'INCOME', category: 'Crypto', description: 'Token payment' },
        { walletId: 'w1', amount: -5000, currency: 'USD', type: 'EXPENSE', category: 'Transfer', description: 'Transfer to EUR account' },
        { walletId: 'w1', amount: 7500, currency: 'USD', type: 'INCOME', category: 'Freelance', description: 'Consulting retainer' },
        { walletId: 'w1', amount: -275, currency: 'USD', type: 'EXPENSE', category: 'Food', description: 'Team lunch' },
        { walletId: 'w1', amount: -450, currency: 'USD', type: 'EXPENSE', category: 'Tech', description: 'Domain & hosting' },
      ];

      businessTx.forEach((tx, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 2));
        transactions.push({
          id: `tx${txId++}`,
          userId: 'user1',
          walletId: tx.walletId,
          date: date.toISOString().split('T')[0],
          amount: Math.abs(tx.amount),
          currency: tx.currency,
          convertedAmount: Math.abs(tx.amount),
          type: tx.type,
          category: tx.category,
          description: tx.description
        });
      });
    } else if (type === 'crypto') {
      wallets.push(
        { id: 'w1', name: 'Bitcoin', type: 'CRYPTO', baseCurrency: 'BTC', balance: 0.45, color: '#F59E0B' },
        { id: 'w2', name: 'Ethereum', type: 'CRYPTO', baseCurrency: 'ETH', balance: 3.8, color: '#6366F1' },
        { id: 'w3', name: 'Solana', type: 'CRYPTO', baseCurrency: 'SOL', balance: 125.5, color: '#10B981' },
        { id: 'w4', name: 'USD Stable', type: 'FIAT', baseCurrency: 'USD', balance: 8500.00, color: '#06B6D4' }
      );

      const cryptoTx = [
        { walletId: 'w1', amount: 0.15, currency: 'BTC', type: 'INCOME', category: 'Crypto', description: 'BTC purchase' },
        { walletId: 'w2', amount: 2.0, currency: 'ETH', type: 'INCOME', category: 'Crypto', description: 'ETH staking rewards' },
        { walletId: 'w3', amount: 50, currency: 'SOL', type: 'INCOME', category: 'Crypto', description: 'SOL airdrop' },
        { walletId: 'w4', amount: -5000, currency: 'USD', type: 'EXPENSE', category: 'Crypto', description: 'Buy BTC' },
        { walletId: 'w4', amount: -3000, currency: 'USD', type: 'EXPENSE', category: 'Crypto', description: 'Buy ETH' },
        { walletId: 'w1', amount: 0.08, currency: 'BTC', type: 'INCOME', category: 'Crypto', description: 'BTC DCA' },
        { walletId: 'w2', amount: 1.5, currency: 'ETH', type: 'INCOME', category: 'Crypto', description: 'ETH purchase' },
        { walletId: 'w3', amount: 75.5, currency: 'SOL', type: 'INCOME', category: 'Crypto', description: 'SOL purchase' },
        { walletId: 'w4', amount: 2500, currency: 'USD', type: 'INCOME', category: 'Crypto', description: 'BTC partial sale' },
        { walletId: 'w2', amount: 0.3, currency: 'ETH', type: 'INCOME', category: 'Crypto', description: 'DeFi yield' },
        { walletId: 'w3', amount: 25, currency: 'SOL', type: 'INCOME', category: 'Crypto', description: 'NFT sale' },
        { walletId: 'w4', amount: -1500, currency: 'USD', type: 'EXPENSE', category: 'Crypto', description: 'Gas fees' },
      ];

      cryptoTx.forEach((tx, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 4));
        transactions.push({
          id: `tx${txId++}`,
          userId: 'user1',
          walletId: tx.walletId,
          date: date.toISOString().split('T')[0],
          amount: Math.abs(tx.amount),
          currency: tx.currency,
          convertedAmount: Math.abs(tx.amount),
          type: tx.type,
          category: tx.category,
          description: tx.description
        });
      });
    }

    const sampleData = {
      wallets,
      transactions,
      categories: ['Salary', 'Food', 'Housing', 'Tech', 'Crypto', 'Freelance', 'Transport', 'Utilities', 'Entertainment', 'Transfer', 'Subscription'],
      recurring: []
    };

    const json = JSON.stringify(sampleData, null, 2);
    navigator.clipboard.writeText(json);
  };

  const handleImport = () => {
    const success = importData(jsonInput);
    setImportStatus(success ? 'success' : 'error');
    if (success) setJsonInput('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
        addCategory(newCategory.trim());
        setNewCategory('');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-24">
      <div className="mb-12">
        <h1 className="text-4xl font-sans font-medium tracking-tight text-text-primary mb-2">
          Settings
        </h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Appearance, currency, categories, and data management.
        </p>
      </div>

      <div className="space-y-16">
        
        {/* APPEARANCE */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded">
              <Palette size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-semibold text-text-primary">Appearance</h2>
              <p className="text-text-secondary text-sm mt-0.5">Theme mode and accent color</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Theme Mode */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">Theme Mode</label>
              <div className="bg-bg-surface border border-border divide-y divide-border">
                <button
                  onClick={() => themeMode !== 'dark' && toggleTheme()}
                  className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
                    themeMode === 'dark' 
                      ? 'bg-bg-surface-highlight text-text-primary' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-highlight/50'
                  }`}
                >
                  <div className={`p-2 ${themeMode === 'dark' ? 'text-accent' : 'text-text-tertiary'}`}>
                    <Moon size={18} />
                  </div>
                  <span className="font-sans text-sm font-medium">Dark</span>
                  {themeMode === 'dark' && <Check size={16} className="ml-auto text-accent" />}
                </button>

                <button
                  onClick={() => themeMode !== 'light' && toggleTheme()}
                  className={`w-full flex items-center gap-4 p-4 transition-colors text-left ${
                    themeMode === 'light' 
                      ? 'bg-bg-surface-highlight text-text-primary' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-highlight/50'
                  }`}
                >
                  <div className={`p-2 ${themeMode === 'light' ? 'text-accent' : 'text-text-tertiary'}`}>
                    <Sun size={18} />
                  </div>
                  <span className="font-sans text-sm font-medium">Light</span>
                  {themeMode === 'light' && <Check size={16} className="ml-auto text-accent" />}
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">Accent Color</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_COLORS.map((preset) => {
                  const isSelected = primaryColor.toLowerCase() === preset.value.toLowerCase();

                  return (
                    <button
                      key={preset.value}
                      onClick={() => setPrimaryColor(preset.value)}
                      className={`relative p-4 border transition-all ${
                        isSelected 
                          ? 'border-accent bg-accent/5' 
                          : 'border-border hover:border-border-strong bg-bg-surface'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 mx-auto mb-3"
                        style={{ backgroundColor: preset.value }}
                      />
                      <div className="text-center text-xs font-mono text-text-secondary">
                        {preset.label}
                      </div>
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <Check size={14} className="text-accent" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Custom Picker */}
                <button
                  onClick={() => colorInputRef.current?.click()}
                  className="relative p-4 border border-dashed border-border hover:border-border-strong bg-bg-surface transition-colors"
                >
                  <div className="w-8 h-8 mx-auto mb-3 flex items-center justify-center text-text-tertiary">
                    <Pipette size={18} />
                  </div>
                  <div className="text-center text-xs font-mono text-text-secondary">
                    Custom
                  </div>
                  <input 
                    ref={colorInputRef}
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* GLOBAL CURRENCY */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded">
              <Globe size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-semibold text-text-primary">Global Currency</h2>
              <p className="text-text-secondary text-sm mt-0.5">Base currency for net worth calculations</p>
            </div>
          </div>

          <div className="bg-bg-surface border border-border p-6">
            <p className="text-text-secondary text-sm mb-6">
              All wallet values normalize to this currency for total net worth display.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_CURRENCIES.map(c => (
                <button
                  key={c}
                  onClick={() => setGlobalCurrency(c)}
                  className={`px-4 py-2.5 font-mono text-sm border transition-all ${
                    globalCurrency === c 
                      ? 'bg-accent text-bg-primary border-accent font-semibold' 
                      : 'bg-bg-primary text-text-secondary border-border hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-sans font-semibold text-text-primary">Categories</h2>
              <p className="text-text-secondary text-sm mt-0.5">Transaction classification tags</p>
            </div>
          </div>

          <div className="bg-bg-surface border border-border p-6">
            <form onSubmit={handleAddCategory} className="flex gap-3 mb-6 max-w-xl">
              <input 
                type="text" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="flex-1 bg-bg-primary border border-border p-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:border-accent focus:outline-none transition-colors"
              />
              <Button type="submit" variant="primary" icon={<Plus size={16} />}>Add</Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {state.categories.map(cat => (
                <div key={cat} className="group flex items-center gap-2 bg-bg-surface-highlight border border-border px-3 py-2 text-sm font-mono text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors">
                  {cat}
                  <button 
                    onClick={() => deleteCategory(cat)}
                    className="text-text-tertiary hover:text-negative transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                    aria-label={`Delete ${cat}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SAMPLE DATA */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-semibold text-text-primary">Sample Data</h2>
              <p className="text-text-secondary text-sm mt-0.5">Generate realistic datasets for testing</p>
            </div>
          </div>

          <div className="bg-bg-surface border border-border p-6">
            <p className="text-text-secondary text-sm mb-6">
              Generate and copy sample data to quickly test features. Each dataset includes wallets, transactions, and categories.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => generateSampleData('personal')}
                className="flex flex-col items-start gap-4 p-5 border border-border hover:border-border-strong bg-bg-primary transition-all text-left group"
              >
                <div className="p-3 bg-bg-surface-highlight group-hover:bg-accent/10 transition-colors">
                  <Wallet size={20} className="text-text-secondary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <div className="font-sans text-sm font-semibold text-text-primary mb-1">Personal Finance</div>
                  <div className="text-xs font-mono text-text-tertiary">3 wallets · 12 transactions</div>
                </div>
              </button>

              <button
                onClick={() => generateSampleData('business')}
                className="flex flex-col items-start gap-4 p-5 border border-border hover:border-border-strong bg-bg-primary transition-all text-left group"
              >
                <div className="p-3 bg-bg-surface-highlight group-hover:bg-accent/10 transition-colors">
                  <ArrowRightLeft size={20} className="text-text-secondary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <div className="font-sans text-sm font-semibold text-text-primary mb-1">Freelance Business</div>
                  <div className="text-xs font-mono text-text-tertiary">3 wallets · 12 transactions · Multi-currency</div>
                </div>
              </button>

              <button
                onClick={() => generateSampleData('crypto')}
                className="flex flex-col items-start gap-4 p-5 border border-border hover:border-border-strong bg-bg-primary transition-all text-left group"
              >
                <div className="p-3 bg-bg-surface-highlight group-hover:bg-accent/10 transition-colors">
                  <Repeat size={20} className="text-text-secondary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <div className="font-sans text-sm font-semibold text-text-primary mb-1">Crypto Portfolio</div>
                  <div className="text-xs font-mono text-text-tertiary">4 wallets · 12 transactions · BTC/ETH/SOL</div>
                </div>
              </button>
            </div>

            <div className="mt-4 p-3 bg-bg-surface-highlight border border-border">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div className="text-xs font-mono text-text-secondary">
                  Click any dataset to copy JSON to clipboard, then paste it in the Import section above.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATA MANAGEMENT */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent/10 rounded">
              <Download size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-sans font-semibold text-text-primary">Data Management</h2>
              <p className="text-text-secondary text-sm mt-0.5">Export and import your financial data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export */}
            <div className="bg-bg-surface border border-border p-6">
              <h3 className="text-base font-sans font-semibold text-text-primary mb-2">Export Data</h3>
              <p className="text-text-secondary text-sm mb-4">Download your complete wallet and transaction history as JSON.</p>
              
              <div className="bg-bg-primary border border-border p-3 mb-4 font-mono text-[11px] text-text-tertiary h-20 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-primary pointer-events-none" />
                {JSON.stringify(state, null, 2).substring(0, 250)}...
              </div>
              <Button onClick={handleCopyExport} variant="secondary" className="w-full">
                Copy to Clipboard
              </Button>
            </div>

            {/* Import */}
            <div className="bg-bg-surface border border-border p-6">
              <h3 className="text-base font-sans font-semibold text-text-primary mb-2">Import Data</h3>
              <p className="text-text-secondary text-sm mb-4">
                Replace current data with JSON. <span className="text-negative">This cannot be undone.</span>
              </p>
              
              <textarea 
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setImportStatus('idle');
                }}
                className="w-full h-20 bg-bg-primary border border-border p-3 text-sm text-text-primary font-mono placeholder:text-text-tertiary focus:border-accent focus:outline-none mb-4 resize-none"
                placeholder="Paste JSON data here"
              />
              
              <div className="flex items-center gap-3">
                <Button onClick={handleImport} variant="secondary" icon={<Upload size={16} />} className="flex-1">
                  Import
                </Button>
                
                {importStatus === 'success' && (
                  <span className="flex items-center gap-1.5 text-positive font-mono text-xs">
                    <Check size={14} /> Success
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="flex items-center gap-1.5 text-negative font-mono text-xs">
                    <AlertCircle size={14} /> Invalid JSON
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
