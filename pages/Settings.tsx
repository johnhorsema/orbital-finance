
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Button } from '../components/ui/Button';
import { Download, Upload, Check, AlertCircle, Plus, X, Globe } from 'lucide-react';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '../types';

export const Settings: React.FC = () => {
  const { exportData, importData, state, addCategory, deleteCategory, globalCurrency, setGlobalCurrency } = useFinance();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [jsonInput, setJsonInput] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleCopyExport = () => {
    const data = exportData();
    navigator.clipboard.writeText(data);
    alert("Data copied to clipboard (In a real app, this would be a file download)");
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
    <div className="p-8 max-w-4xl mx-auto pb-20">
      <h1 className="text-4xl font-sans font-light text-white tracking-tighter mb-12">
        SYSTEM <span className="text-gray-500">CONFIG</span>
      </h1>

      <div className="space-y-12">
        
        {/* Global Currency Section */}
        <div className="bg-surface border border-white/10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-white font-sans mb-2 flex items-center gap-2">
                   <Globe size={20} className="text-neon-cyan" />
                   Global Unit of Account
                </h2>
                <p className="text-gray-500 text-sm">
                    Sets the base currency for calculating your total net worth and standardizing value across wallets.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {SUPPORTED_CURRENCIES.map(c => (
                    <button
                        key={c}
                        onClick={() => setGlobalCurrency(c)}
                        className={`px-4 py-2 rounded-sm font-mono text-sm border transition-all ${
                            globalCurrency === c 
                                ? 'bg-neon-cyan text-black border-neon-cyan font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                                : 'bg-black text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>

        {/* Category Management */}
        <div className="bg-surface border border-white/10 p-8">
            <h2 className="text-xl text-white font-sans mb-6">Category Protocols</h2>
            
            <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
                <input 
                    type="text" 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Tag..."
                    className="flex-1 bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-cyan focus:outline-none"
                />
                <Button type="submit" variant="secondary" icon={<Plus size={16} />}>Add</Button>
            </form>

            <div className="flex flex-wrap gap-2">
                {state.categories.map(cat => (
                    <div key={cat} className="group flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-2 rounded-sm text-sm font-mono text-gray-300 hover:border-white/20 transition-colors">
                        {cat}
                        <button 
                            onClick={() => deleteCategory(cat)}
                            className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Export Section */}
        <div className="bg-surface border border-white/10 p-8">
           <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-white font-sans mb-2">Data Exfiltration</h2>
                <p className="text-gray-500 text-sm">Export your entire wallet and transaction history to a JSON object.</p>
              </div>
              <Download className="text-neon-green" />
           </div>
           <div className="bg-black p-4 rounded border border-white/5 font-mono text-xs text-gray-500 overflow-hidden h-32 mb-4">
             {JSON.stringify(state, null, 2).substring(0, 300)}...
           </div>
           <Button onClick={handleCopyExport} variant="neon">Copy to Clipboard</Button>
        </div>

        {/* Import Section */}
        <div className="bg-surface border border-white/10 p-8">
           <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-white font-sans mb-2">Data Ingestion</h2>
                <p className="text-gray-500 text-sm">Overwrite current state with an external dataset. Warning: This action is irreversible.</p>
              </div>
              <Upload className="text-neon-pink" />
           </div>
           
           <textarea 
             value={jsonInput}
             onChange={(e) => {
               setJsonInput(e.target.value);
               setImportStatus('idle');
             }}
             className="w-full h-40 bg-black border border-white/10 p-4 text-white font-mono text-sm focus:border-neon-pink focus:outline-none mb-4"
             placeholder="Paste JSON blob here..."
           />
           
           <div className="flex items-center gap-4">
             <Button onClick={handleImport} variant="secondary">Import Data</Button>
             
             {importStatus === 'success' && (
               <span className="flex items-center gap-2 text-neon-green font-mono text-sm">
                 <Check size={16} /> Import Successful
               </span>
             )}
             {importStatus === 'error' && (
               <span className="flex items-center gap-2 text-red-500 font-mono text-sm">
                 <AlertCircle size={16} /> Invalid JSON
               </span>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
