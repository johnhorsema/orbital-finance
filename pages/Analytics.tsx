import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Grid3X3, Flame } from 'lucide-react';
import { CurrencyCode } from '../types';

export const Analytics: React.FC = () => {
  const { state, rates, globalCurrency } = useFinance();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Helper: Convert to global currency (Logic duplicated from Dashboard to keep component isolated)
  const getGlobalValue = (val: number, curr: CurrencyCode) => {
    if (curr === globalCurrency) return val;
    const rate = rates[curr.toLowerCase()];
    return rate ? val / rate : 0;
  };

  // ---------------------------------------------------------------------------
  // Data Processing
  // ---------------------------------------------------------------------------

  // 1. Get all expenses
  const expenses = useMemo(() => {
    return state.transactions.filter(t => t.type === 'EXPENSE');
  }, [state.transactions]);

  // 2. Aggregate by Date (YYYY-MM-DD)
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(tx => {
       const date = tx.date;
       const val = getGlobalValue(tx.amount, tx.currency);
       map[date] = (map[date] || 0) + val;
    });
    return map;
  }, [expenses, rates, globalCurrency]);

  // 3. Aggregate by Category & Month (0-11) for current selected year
  const categoryMatrix = useMemo(() => {
     const map: Record<string, number[]> = {};
     state.categories.forEach(cat => {
         map[cat] = new Array(12).fill(0);
     });

     expenses.forEach(tx => {
         const d = new Date(tx.date);
         if (d.getFullYear() === selectedYear) {
             const month = d.getMonth();
             const val = getGlobalValue(tx.amount, tx.currency);
             if (map[tx.category]) {
                map[tx.category][month] += val;
             }
         }
     });

     // Filter out categories with 0 spend in the whole year to keep UI clean
     const filtered: Record<string, number[]> = {};
     Object.entries(map).forEach(([cat, months]) => {
         if (months.some(v => v > 0)) filtered[cat] = months;
     });

     return filtered;
  }, [expenses, selectedYear, rates, globalCurrency, state.categories]);

  // Calculate Max Values for scaling intensity
  const maxDailySpend = useMemo(() => {
     const values = Object.values(dailyData) as number[];
     return values.length > 0 ? Math.max(...values) : 1;
  }, [dailyData]);

  const maxCategorySpend = useMemo(() => {
      let max = 0;
      const values = Object.values(categoryMatrix) as number[][];
      values.forEach(months => {
          months.forEach(v => {
              if (v > max) max = v;
          });
      });
      return max || 1;
  }, [categoryMatrix]);


  // ---------------------------------------------------------------------------
  // Heatmap Grid Logic
  // ---------------------------------------------------------------------------
  
  // Generate Days for the Selected Year
  const calendarGrid = useMemo(() => {
      const days = [];
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      
      // Pad beginning if year doesn't start on Sunday (0)
      // Note: We'll render Sunday as row 0
      const startDay = startDate.getDay(); // 0 (Sun) - 6 (Sat)
      
      // We need a grid of 7 rows (days) x 53 cols (weeks)
      // We will generate a flat array and use CSS Grid with grid-auto-flow: column
      
      // Pre-fill empty slots for previous year days in the first week
      for (let i = 0; i < startDay; i++) {
          days.push(null); 
      }

      const current = new Date(startDate);
      while (current <= endDate) {
          days.push(new Date(current));
          current.setDate(current.getDate() + 1);
      }
      
      return days;
  }, [selectedYear]);

  // Color Scale Helper (Pink/Red for Expenses)
  const getIntensityColor = (value: number, max: number, type: 'daily' | 'matrix') => {
      if (value === 0) return 'bg-content/5';
      const ratio = value / max;
      
      // Using opacity stops for neon pink
      if (ratio < 0.2) return 'bg-neon-pink/20';
      if (ratio < 0.4) return 'bg-neon-pink/40';
      if (ratio < 0.6) return 'bg-neon-pink/60';
      if (ratio < 0.8) return 'bg-neon-pink/80';
      return 'bg-neon-pink shadow-[0_0_10px_rgba(var(--color-neon-pink),0.5)]';
  };

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-sans font-light text-content tracking-tighter">
            SPENDING <span className="text-neon-pink font-bold">THERMOGRAPHY</span>
          </h1>
          <p className="text-muted mt-2 font-mono">
            Visualizing capital outflow intensity across temporal and categorical vectors.
          </p>
        </div>
        
        {/* Year Selector */}
        <div className="flex items-center gap-4 bg-surface border border-content/10 rounded-sm p-1">
            <button 
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-2 hover:bg-content/5 rounded-sm text-muted hover:text-content transition-colors"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="font-mono font-bold text-lg w-16 text-center">{selectedYear}</span>
            <button 
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-2 hover:bg-content/5 rounded-sm text-muted hover:text-content transition-colors"
                disabled={selectedYear >= new Date().getFullYear()}
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {/* 1. CALENDAR HEATMAP */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-content/10 p-6 md:p-8 mb-8 overflow-hidden"
      >
         <div className="flex items-center gap-3 mb-6">
             <Calendar className="text-neon-pink" size={20} />
             <h2 className="text-xl font-sans text-content">Daily Intensity Log</h2>
         </div>
         
         <div className="overflow-x-auto pb-4 custom-scrollbar">
             <div className="min-w-[800px]">
                 {/* Month Labels aligned approx */}
                 <div className="flex mb-2 pl-8">
                     {MONTH_LABELS.map(m => (
                         <div key={m} className="flex-1 text-xs font-mono text-muted">{m}</div>
                     ))}
                 </div>
                 
                 <div className="flex gap-2">
                     {/* Day Rows Labels */}
                     <div className="flex flex-col justify-between text-[10px] font-mono text-muted py-[2px] h-[140px] w-6">
                         <span>Mon</span>
                         <span>Wed</span>
                         <span>Fri</span>
                     </div>
                     
                     {/* The Grid */}
                     <div className="flex-1 grid grid-rows-7 grid-flow-col gap-[3px] h-[140px]">
                         {calendarGrid.map((date, i) => {
                             if (!date) return <div key={`empty-${i}`} className="w-3 h-3 md:w-4 md:h-4 bg-transparent" />;
                             
                             const dateStr = date.toISOString().split('T')[0];
                             const value = dailyData[dateStr] || 0;
                             
                             return (
                                 <div 
                                    key={dateStr}
                                    className={`w-3 h-3 md:w-4 md:h-4 rounded-[1px] transition-all hover:scale-125 hover:z-10 relative group ${getIntensityColor(value, maxDailySpend, 'daily')}`}
                                 >
                                     {/* Tooltip */}
                                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap bg-surfaceHighlight border border-content/10 p-2 text-xs font-mono text-content shadow-xl">
                                         <div className="font-bold">{date.toLocaleDateString()}</div>
                                         <div>{value > 0 ? `-${value.toFixed(2)} ${globalCurrency}` : 'No Spend'}</div>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
                 
                 {/* Legend */}
                 <div className="flex justify-end items-center gap-2 mt-4 text-[10px] font-mono text-muted">
                     <span>Less</span>
                     <div className="flex gap-1">
                         <div className="w-3 h-3 bg-content/5 rounded-[1px]" />
                         <div className="w-3 h-3 bg-neon-pink/20 rounded-[1px]" />
                         <div className="w-3 h-3 bg-neon-pink/40 rounded-[1px]" />
                         <div className="w-3 h-3 bg-neon-pink/60 rounded-[1px]" />
                         <div className="w-3 h-3 bg-neon-pink/80 rounded-[1px]" />
                         <div className="w-3 h-3 bg-neon-pink rounded-[1px]" />
                     </div>
                     <span>More</span>
                 </div>
             </div>
         </div>
      </motion.div>

      {/* 2. CATEGORY MATRIX */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface border border-content/10 p-6 md:p-8"
      >
         <div className="flex items-center gap-3 mb-6">
             <Grid3X3 className="text-neon-cyan" size={20} />
             <h2 className="text-xl font-sans text-content">Category Flux Matrix</h2>
         </div>

         {Object.keys(categoryMatrix).length === 0 ? (
             <div className="text-center py-12 text-muted font-mono text-sm border border-dashed border-content/10">
                 No spending data available for {selectedYear}
             </div>
         ) : (
            <div className="overflow-x-auto pb-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 text-xs font-mono text-muted uppercase font-normal w-32 border-b border-content/5">Category</th>
                            {MONTH_LABELS.map(m => (
                                <th key={m} className="p-2 text-xs font-mono text-muted text-center font-normal border-b border-content/5">{m}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(Object.entries(categoryMatrix) as [string, number[]][]).map(([category, months], i) => (
                            <tr key={category} className="group hover:bg-content/5 transition-colors">
                                <td className="p-3 text-sm font-sans font-bold text-content border-b border-content/5 group-hover:border-transparent">
                                    {category}
                                </td>
                                {months.map((val, mIndex) => (
                                    <td key={mIndex} className="p-1 border-b border-content/5 group-hover:border-transparent">
                                        <div className="h-full w-full flex items-center justify-center py-2 relative group/cell">
                                            <div 
                                                className={`w-full h-8 rounded-sm transition-all ${getIntensityColor(val, maxCategorySpend, 'matrix')}`}
                                                style={{ opacity: val === 0 ? 0.3 : 1 }}
                                            />
                                            {val > 0 && (
                                                <div className="absolute -top-8 bg-black/90 text-white text-[10px] p-1 px-2 rounded opacity-0 group-hover/cell:opacity-100 pointer-events-none whitespace-nowrap z-10 font-mono">
                                                    {val.toFixed(0)}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </motion.div>
    </div>
  );
};