


import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Button } from '../components/ui/Button';
import { Download, Upload, Check, AlertCircle, Plus, X, Globe, Palette, Pipette, Sun, Moon } from 'lucide-react';
import { SUPPORTED_CURRENCIES, PRESET_COLORS } from '../types';

export const Settings: React.FC = () => {
  const { exportData, importData, state, addCategory, deleteCategory, globalCurrency, setGlobalCurrency, primaryColor, setPrimaryColor, themeMode, toggleTheme } = useFinance();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [jsonInput, setJsonInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);

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
      <h1 className="text-4xl font-sans font-light text-content tracking-tighter mb-12">
        SYSTEM <span className="text-muted">CONFIG</span>
      </h1>

      <div className="space-y-12">
        
        {/* Global Currency Section */}
        <div className="bg-surface border border-content/10 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-content font-sans mb-2 flex items-center gap-2">
                   <Globe size={20} className="text-neon-cyan" />
                   Global Unit of Account
                </h2>
                <p className="text-muted text-sm">
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
                                ? 'bg-neon-cyan text-black border-neon-cyan font-bold shadow-[0_0_10px_rgba(var(--color-neon-cyan),0.3)]' 
                                : 'bg-field text-muted border-content/10 hover:border-content/30 hover:text-content'
                        }`}
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>

        {/* Dynamic Theme Section */}
        <div className="bg-surface border border-content/10 p-8">
           <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-content font-sans mb-2 flex items-center gap-2">
                   <Palette size={20} className="text-neon-green" />
                   Interface Calibration
                </h2>
                <p className="text-muted text-sm">
                    Select a primary frequency for the interface. The system will auto-generate harmonic accents.
                </p>
              </div>
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-field border border-content/10 rounded-sm text-sm font-mono text-content hover:border-neon-green/50 transition-colors"
              >
                  {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            <div className="space-y-6">
                {/* Generated Preview Bar */}
                <div className="h-4 w-full rounded-sm overflow-hidden flex border border-content/5">
                    <div className="h-full flex-1 bg-void" title="Void" />
                    <div className="h-full flex-1 bg-surface" title="Surface" />
                    <div className="h-full flex-1 bg-surfaceHighlight" title="Highlight" />
                    <div className="h-full flex-1 bg-neon-green" title="Primary" />
                    <div className="h-full flex-1 bg-neon-purple" title="Secondary" />
                    <div className="h-full flex-1 bg-neon-cyan" title="Tertiary" />
                    <div className="h-full flex-1 bg-neon-pink" title="Quaternary" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Presets */}
                    {PRESET_COLORS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => setPrimaryColor(preset.value)}
                            className={`group relative p-3 border rounded-sm transition-all text-left flex items-center gap-3 overflow-hidden ${
                                primaryColor.toLowerCase() === preset.value.toLowerCase() 
                                    ? 'bg-content/5 border-neon-green shadow-[0_0_15px_rgba(var(--color-neon-green),0.1)]' 
                                    : 'bg-field/50 border-content/10 hover:border-content/30'
                            }`}
                        >
                             <div 
                                className="w-8 h-8 rounded-full border border-content/20 shadow-lg" 
                                style={{ backgroundColor: preset.value }} 
                             />
                             <div className="flex-1 min-w-0">
                                <div className={`font-sans text-sm truncate ${primaryColor.toLowerCase() === preset.value.toLowerCase() ? 'text-content' : 'text-muted group-hover:text-content'}`}>
                                    {preset.label}
                                </div>
                                <div className="text-[10px] text-muted font-mono uppercase">
                                    {preset.value}
                                </div>
                             </div>
                             
                             {/* Active Indicator glow */}
                             {primaryColor.toLowerCase() === preset.value.toLowerCase() && (
                                <div className="absolute inset-0 bg-neon-green/5 pointer-events-none" />
                             )}
                        </button>
                    ))}

                    {/* Custom Color Picker */}
                    <button
                        onClick={() => colorInputRef.current?.click()}
                        className="group relative p-3 border border-dashed border-content/20 rounded-sm transition-all text-left flex items-center gap-3 hover:border-content/50 hover:bg-content/5"
                    >
                         <div className="w-8 h-8 rounded-full border border-content/20 shadow-lg bg-[conic-gradient(from_180deg,red,yellow,green,cyan,blue,magenta,red)] flex items-center justify-center">
                            <Pipette size={14} className="text-black drop-shadow-md" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="font-sans text-sm text-muted group-hover:text-content">
                                Custom
                            </div>
                            <div className="text-[10px] text-muted font-mono uppercase">
                                HEX CODE
                            </div>
                         </div>
                         <input 
                            ref={colorInputRef}
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                         />
                    </button>
                </div>
            </div>
        </div>

        {/* Category Management */}
        <div className="bg-surface border border-content/10 p-8">
            <h2 className="text-xl text-content font-sans mb-6">Category Protocols</h2>
            
            <form onSubmit={handleAddCategory} className="flex gap-4 mb-6">
                <input 
                    type="text" 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New Category Tag..."
                    className="flex-1 bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-cyan focus:outline-none"
                />
                <Button type="submit" variant="secondary" icon={<Plus size={16} />}>Add</Button>
            </form>

            <div className="flex flex-wrap gap-2">
                {state.categories.map(cat => (
                    <div key={cat} className="group flex items-center gap-2 bg-content/5 border border-content/5 px-3 py-2 rounded-sm text-sm font-mono text-muted hover:border-content/20 transition-colors">
                        {cat}
                        <button 
                            onClick={() => deleteCategory(cat)}
                            className="text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Export Section */}
        <div className="bg-surface border border-content/10 p-8">
           <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-content font-sans mb-2">Data Exfiltration</h2>
                <p className="text-muted text-sm">Export your entire wallet and transaction history to a JSON object.</p>
              </div>
              <Download className="text-neon-green" />
           </div>
           <div className="bg-field p-4 rounded border border-content/5 font-mono text-xs text-muted overflow-hidden h-32 mb-4">
             {JSON.stringify(state, null, 2).substring(0, 300)}...
           </div>
           <Button onClick={handleCopyExport} variant="neon">Copy to Clipboard</Button>
        </div>

        {/* Import Section */}
        <div className="bg-surface border border-content/10 p-8">
           <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl text-content font-sans mb-2">Data Ingestion</h2>
                <p className="text-muted text-sm">Overwrite current state with an external dataset. Warning: This action is irreversible.</p>
              </div>
              <Upload className="text-neon-pink" />
           </div>
           
           <textarea 
             value={jsonInput}
             onChange={(e) => {
               setJsonInput(e.target.value);
               setImportStatus('idle');
             }}
             className="w-full h-40 bg-field border border-content/10 p-4 text-content font-mono text-sm focus:border-neon-pink focus:outline-none mb-4"
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