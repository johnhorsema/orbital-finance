
import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Button } from '../components/ui/Button';
import { Download, Upload, Check, AlertCircle, Plus, X, Globe, Palette, Pipette, Sun, Moon, Monitor, LayoutTemplate } from 'lucide-react';
import { SUPPORTED_CURRENCIES, PRESET_COLORS } from '../types';
import { motion } from 'framer-motion';

// Helper to add descriptions to the presets for a more "Human" feel
const THEME_DESCRIPTIONS: Record<string, string> = {
  '#CCFF00': 'Standard issue high-visibility telemetry.',
  '#00F0FF': 'Cool temperature for analytical focus.',
  '#FF0099': 'High energy warning protocol.',
  '#7000FF': 'Deep space sensory immersion.',
  '#FF5F1F': 'Alert status: Elevated.',
  '#00FF41': 'Legacy terminal emulation.',
  '#DC143C': 'Critical error handling aesthetics.',
  '#DAA520': 'Premium asset tracking.',
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
    alert("Data copied to clipboard");
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
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-sans font-light text-content tracking-tighter">
          SYSTEM <span className="text-muted">CONFIG</span>
        </h1>
        <p className="text-muted font-mono text-sm max-w-xl">
            Manage global parameters, interface calibration, and data sovereignty protocols.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* --- SECTION: INTERFACE CALIBRATION (IDEO REDESIGN) --- */}
        <section className="space-y-8">
            <div className="flex items-center gap-3 text-content border-b border-content/10 pb-4">
                <Palette size={20} className="text-neon-cyan" />
                <h2 className="text-xl font-sans">Interface Calibration</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. ATMOSPHERE (Light/Dark) */}
                <div className="lg:col-span-4 space-y-4">
                    <label className="text-xs font-mono text-muted uppercase tracking-widest">Atmosphere</label>
                    <div className="bg-surface border border-content/10 p-1 rounded-lg flex flex-col gap-1">
                        <button
                            onClick={() => themeMode !== 'dark' && toggleTheme()}
                            className={`relative flex items-center gap-4 p-4 rounded-md transition-all overflow-hidden text-left group ${themeMode === 'dark' ? 'text-white' : 'text-muted hover:text-content'}`}
                        >
                            {themeMode === 'dark' && (
                                <motion.div layoutId="atmosphere-active" className="absolute inset-0 bg-content/5 border border-content/10 rounded-md" />
                            )}
                            <div className={`relative z-10 p-2 rounded-full ${themeMode === 'dark' ? 'bg-indigo-950 text-indigo-400' : 'bg-field text-muted'}`}>
                                <Moon size={20} />
                            </div>
                            <div className="relative z-10">
                                <div className="font-sans font-bold text-sm">Void Mode</div>
                                <div className="text-[10px] font-mono opacity-70">Low light. High contrast.</div>
                            </div>
                        </button>

                        <button
                            onClick={() => themeMode !== 'light' && toggleTheme()}
                            className={`relative flex items-center gap-4 p-4 rounded-md transition-all overflow-hidden text-left group ${themeMode === 'light' ? 'text-black' : 'text-muted hover:text-content'}`}
                        >
                            {themeMode === 'light' && (
                                <motion.div layoutId="atmosphere-active" className="absolute inset-0 bg-white border border-gray-200 rounded-md shadow-sm" />
                            )}
                            <div className={`relative z-10 p-2 rounded-full ${themeMode === 'light' ? 'bg-yellow-100 text-yellow-600' : 'bg-field text-muted'}`}>
                                <Sun size={20} />
                            </div>
                            <div className="relative z-10">
                                <div className="font-sans font-bold text-sm">Daylight Mode</div>
                                <div className="text-[10px] font-mono opacity-70">Paper-like reading environment.</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* 2. SPECTRUM (Color Presets with Mini-UI Previews) */}
                <div className="lg:col-span-8 space-y-4">
                     <label className="text-xs font-mono text-muted uppercase tracking-widest">Resonance Frequency</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {PRESET_COLORS.map((preset) => {
                            const isSelected = primaryColor.toLowerCase() === preset.value.toLowerCase();
                            const desc = THEME_DESCRIPTIONS[preset.value] || 'Custom configuration.';

                            return (
                                <motion.button
                                    key={preset.value}
                                    onClick={() => setPrimaryColor(preset.value)}
                                    className={`relative group h-40 rounded-lg border text-left overflow-hidden flex flex-col transition-all ${
                                        isSelected 
                                        ? 'border-content ring-1 ring-content/20 shadow-2xl' 
                                        : 'border-content/10 hover:border-content/30 bg-surface'
                                    }`}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* Mini UI Preview (Show, Don't Tell) */}
                                    <div className="flex-1 w-full bg-field relative p-2 overflow-hidden pointer-events-none">
                                        {/* Abstract Sidebar */}
                                        <div className="absolute left-0 top-0 bottom-0 w-6 bg-surface border-r border-content/5 flex flex-col items-center pt-2 gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.value }} />
                                            <div className="w-3 h-0.5 bg-content/10 rounded-full" />
                                            <div className="w-3 h-0.5 bg-content/10 rounded-full" />
                                        </div>
                                        {/* Abstract Content */}
                                        <div className="ml-8 mt-1 space-y-2">
                                            <div className="w-16 h-2 bg-content/10 rounded-sm" />
                                            <div className="flex gap-1">
                                                <div className="w-8 h-8 rounded-sm bg-surface border border-content/5 flex items-center justify-center">
                                                    <div className="w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: preset.value }} />
                                                </div>
                                                <div className="w-12 h-8 rounded-sm bg-surface border border-content/5" />
                                            </div>
                                            {/* Active Element Representation */}
                                            <div 
                                                className="w-full h-1 rounded-full opacity-50"
                                                style={{ backgroundColor: preset.value }}
                                            />
                                        </div>
                                        {/* Overlay Tint on Hover */}
                                        <div 
                                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                                            style={{ backgroundColor: preset.value }}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className={`p-3 text-[10px] font-mono border-t border-content/5 ${isSelected ? 'bg-content/5' : 'bg-surface'}`}>
                                        <div className="font-bold text-content truncate mb-1">{preset.label}</div>
                                        <div className="text-muted line-clamp-2 leading-tight opacity-70">
                                            {desc}
                                        </div>
                                    </div>
                                    
                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <motion.div 
                                            layoutId="theme-selection-ring" 
                                            className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
                                            style={{ borderColor: preset.value }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}

                         {/* Custom Picker Card */}
                         <button
                            onClick={() => colorInputRef.current?.click()}
                            className="relative group h-40 rounded-lg border border-dashed border-content/20 hover:border-content/50 bg-field/50 flex flex-col items-center justify-center gap-3 transition-colors"
                         >
                             <div className="p-3 rounded-full bg-content/5 group-hover:bg-content/10 transition-colors">
                                <Pipette size={20} className="text-content" />
                             </div>
                             <div className="text-xs font-mono text-muted group-hover:text-content">Manual Override</div>
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
        </section>

        {/* --- SECTION: GLOBAL UNIT --- */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 text-content border-b border-content/10 pb-4">
                <Globe size={20} className="text-neon-cyan" />
                <h2 className="text-xl font-sans">Global Unit of Account</h2>
            </div>
            
            <div className="bg-surface border border-content/10 p-6 lg:p-8 rounded-sm">
                <p className="text-muted text-sm mb-6 max-w-2xl">
                    Sets the base currency for calculating your total net worth. Values across all wallets (Fiat & Crypto) are normalized to this unit using real-time oracle data.
                </p>
                <div className="flex flex-wrap gap-3">
                    {SUPPORTED_CURRENCIES.map(c => (
                        <button
                            key={c}
                            onClick={() => setGlobalCurrency(c)}
                            className={`px-4 py-3 rounded-sm font-mono text-sm border transition-all ${
                                globalCurrency === c 
                                    ? 'bg-neon-cyan text-black border-neon-cyan font-bold shadow-[0_0_15px_rgba(var(--color-neon-cyan),0.3)]' 
                                    : 'bg-field text-muted border-content/10 hover:border-content/30 hover:text-content'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>
        </section>

        {/* --- SECTION: TAXONOMY --- */}
        <section className="space-y-6">
            <div className="flex items-center gap-3 text-content border-b border-content/10 pb-4">
                <LayoutTemplate size={20} className="text-neon-purple" />
                <h2 className="text-xl font-sans">Category Protocols</h2>
            </div>

            <div className="bg-surface border border-content/10 p-6 lg:p-8 rounded-sm">
                <form onSubmit={handleAddCategory} className="flex gap-4 mb-8 max-w-lg">
                    <input 
                        type="text" 
                        value={newCategory} 
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Define new category tag..."
                        className="flex-1 bg-field border border-content/10 p-3 text-content font-mono focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/50 transition-all rounded-sm"
                    />
                    <Button type="submit" variant="secondary" icon={<Plus size={16} />}>Add</Button>
                </form>

                <div className="flex flex-wrap gap-2">
                    {state.categories.map(cat => (
                        <div key={cat} className="group flex items-center gap-2 bg-content/5 border border-content/5 px-3 py-2 rounded-sm text-sm font-mono text-muted hover:border-neon-purple/30 hover:text-content transition-colors">
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
        </section>

        {/* --- SECTION: DATA SOVEREIGNTY --- */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-content border-b border-content/10 pb-4">
              <Download size={20} className="text-neon-green" />
              <h2 className="text-xl font-sans">Data Sovereignty</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Export */}
               <div className="bg-surface border border-content/10 p-6 lg:p-8 rounded-sm flex flex-col h-full">
                   <h3 className="text-lg font-sans text-content mb-2">Exfiltration</h3>
                   <p className="text-muted text-sm mb-4 flex-1">Export your entire wallet ledger and transaction history to a portable JSON object.</p>
                   
                   <div className="bg-field p-4 rounded border border-content/5 font-mono text-[10px] text-muted overflow-hidden h-24 mb-4 relative">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-field pointer-events-none" />
                     {JSON.stringify(state, null, 2).substring(0, 300)}...
                   </div>
                   <Button onClick={handleCopyExport} variant="neon" className="w-full">Copy to Clipboard</Button>
               </div>

               {/* Import */}
               <div className="bg-surface border border-content/10 p-6 lg:p-8 rounded-sm flex flex-col h-full">
                   <h3 className="text-lg font-sans text-content mb-2">Ingestion</h3>
                   <p className="text-muted text-sm mb-4">Overwrite current state with an external dataset. <span className="text-red-400">Warning: This action is irreversible.</span></p>
                   
                   <textarea 
                     value={jsonInput}
                     onChange={(e) => {
                       setJsonInput(e.target.value);
                       setImportStatus('idle');
                     }}
                     className="w-full h-24 bg-field border border-content/10 p-4 text-content font-mono text-xs focus:border-neon-pink focus:outline-none mb-4 rounded-sm resize-none"
                     placeholder="Paste JSON blob here..."
                   />
                   
                   <div className="mt-auto flex items-center gap-4">
                     <Button onClick={handleImport} variant="secondary" className="flex-1">Import Data</Button>
                     
                     {importStatus === 'success' && (
                       <span className="flex items-center gap-2 text-neon-green font-mono text-xs">
                         <Check size={14} /> Success
                       </span>
                     )}
                     {importStatus === 'error' && (
                       <span className="flex items-center gap-2 text-red-500 font-mono text-xs">
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
