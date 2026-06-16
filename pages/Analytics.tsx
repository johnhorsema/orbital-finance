import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Calendar, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { CurrencyCode } from '../types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const Analytics: React.FC = () => {
  const { state, rates, globalCurrency } = useFinance();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hoveredCell, setHoveredCell] = useState<{ type: 'daily' | 'category', data: any } | null>(null);

  const getGlobalValue = (val: number, curr: CurrencyCode) => {
    if (curr === globalCurrency) return val;
    const rate = rates[curr.toLowerCase()];
    return rate ? val / rate : 0;
  };

  const expenses = useMemo(() => {
    return state.transactions.filter(t => t.type === 'EXPENSE');
  }, [state.transactions]);

  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(tx => {
       const date = tx.date;
       const val = getGlobalValue(tx.amount, tx.currency);
       map[date] = (map[date] || 0) + val;
    });
    return map;
  }, [expenses, rates, globalCurrency]);

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

     const filtered: Record<string, number[]> = {};
     Object.entries(map).forEach(([cat, months]) => {
         if (months.some(v => v > 0)) filtered[cat] = months;
     });

     return filtered;
  }, [expenses, selectedYear, rates, globalCurrency, state.categories]);

  const maxDailySpend = useMemo(() => {
     const values = Object.values(dailyData) as number[];
     return values.length > 0 ? Math.max(...values) : 1;
  }, [dailyData]);

  const maxCategorySpend = useMemo(() => {
      let max = 0;
      Object.values(categoryMatrix).forEach((months: number[]) => {
          months.forEach(v => {
              if (v > max) max = v;
          });
      });
      return max || 1;
  }, [categoryMatrix]);
  
  const calendarGrid = useMemo(() => {
      const days: (Date | null)[] = [];
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      
      const startDay = startDate.getDay();
      
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

  const getHeatColor = (value: number, max: number) => {
      if (value === 0) return 'var(--color-bg-surface)';
      const ratio = value / max;
      
      // Extract hue from accent color CSS variable
      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
      const hueMatch = accentColor.match(/oklch\([\d.]+\s+[\d.]+\s+([\d.]+)\)/);
      const hue = hueMatch ? parseFloat(hueMatch[1]) : 250; // Default to 250 (blue)
      
      // Generate heatmap colors using theme hue with varying lightness and chroma
      if (ratio < 0.2) return `oklch(0.45 0.08 ${hue})`;
      if (ratio < 0.4) return `oklch(0.50 0.12 ${hue})`;
      if (ratio < 0.6) return `oklch(0.55 0.15 ${hue})`;
      if (ratio < 0.8) return `oklch(0.60 0.17 ${hue})`;
      return `oklch(0.62 0.18 ${hue})`;
  };

  const formatCurrency = (val: number) => {
    return `${val.toFixed(2)} ${globalCurrency}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-sans font-medium tracking-tight text-text-primary">
            Spending Analysis
          </h1>
          <p className="text-text-secondary mt-2 font-mono text-sm">
            Expense patterns across time and categories for {selectedYear}
          </p>
        </div>
        
        <div className="flex items-center gap-1 bg-bg-surface border border-border">
            <button 
                onClick={() => setSelectedYear(prev => prev - 1)}
                className="p-2 hover:bg-bg-surface-highlight text-text-secondary hover:text-text-primary transition-colors duration-150"
                aria-label="Previous year"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="font-mono font-medium text-text-primary w-16 text-center">{selectedYear}</span>
            <button 
                onClick={() => setSelectedYear(prev => prev + 1)}
                className="p-2 hover:bg-bg-surface-highlight text-text-secondary hover:text-text-primary transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none"
                disabled={selectedYear >= new Date().getFullYear()}
                aria-label="Next year"
            >
                <ChevronRight size={16} />
            </button>
        </div>
      </div>

      <div className="bg-bg-surface border border-border p-6 mb-8">
         <div className="flex items-center gap-2 mb-6">
             <Calendar className="text-text-secondary" size={18} />
             <h2 className="text-lg font-sans font-medium text-text-primary">Daily Spending Heatmap</h2>
         </div>
         
         <div className="overflow-x-auto">
             <div className="min-w-[800px]">
                 <div className="flex mb-2 pl-8">
                     {MONTH_LABELS.map((m, i) => (
                         <div key={m} className="flex-1 text-xs font-mono text-text-secondary" style={{ marginLeft: i > 0 ? '0' : '0' }}>{m}</div>
                     ))}
                 </div>
                 
                 <div className="flex gap-3">
                     <div className="flex flex-col justify-between text-[10px] font-mono text-text-secondary py-1 h-[112px] w-7">
                         <span>Sun</span>
                         <span>Tue</span>
                         <span>Thu</span>
                         <span>Sat</span>
                     </div>
                     
                     <div className="flex-1 grid grid-rows-7 grid-flow-col gap-1 h-[112px]">
                         {calendarGrid.map((date, i) => {
                             if (!date) return <div key={`empty-${i}`} className="w-3 h-3 bg-transparent" />;
                             
                             const dateStr = date.toISOString().split('T')[0];
                             const value = dailyData[dateStr] || 0;
                             
                             return (
                                 <div 
                                    key={dateStr}
                                    onMouseEnter={() => setHoveredCell({ type: 'daily', data: { date, value } })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    className="w-3 h-3 transition-all duration-150 hover:scale-150 hover:z-10 cursor-pointer"
                                    style={{ 
                                        backgroundColor: getHeatColor(value, maxDailySpend),
                                    }}
                                 />
                             );
                         })}
                     </div>
                 </div>
                 
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                     <div className="text-xs font-mono text-text-secondary">
                         {Object.keys(dailyData).length > 0 
                             ? `${Object.keys(dailyData).length} days with expenses`
                             : 'No expense data for this year'
                         }
                     </div>
                     <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
                         <span>Less</span>
                         <div className="flex gap-1">
                             <div className="w-3 h-3" style={{ backgroundColor: 'var(--color-bg-surface)' }} />
                             <div className="w-3 h-3" style={{ backgroundColor: getHeatColor(0.1, 1) }} />
                             <div className="w-3 h-3" style={{ backgroundColor: getHeatColor(0.3, 1) }} />
                             <div className="w-3 h-3" style={{ backgroundColor: getHeatColor(0.5, 1) }} />
                             <div className="w-3 h-3" style={{ backgroundColor: getHeatColor(0.7, 1) }} />
                             <div className="w-3 h-3" style={{ backgroundColor: getHeatColor(0.9, 1) }} />
                         </div>
                         <span>More</span>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      <div className="bg-bg-surface border border-border p-6">
         <div className="flex items-center gap-2 mb-6">
             <Grid3X3 className="text-text-secondary" size={18} />
             <h2 className="text-lg font-sans font-medium text-text-primary">Category Breakdown by Month</h2>
         </div>

         {Object.keys(categoryMatrix).length === 0 ? (
             <div className="text-center py-16 border border-dashed border-border">
                 <p className="text-text-secondary font-mono text-sm">
                     No expense data for {selectedYear}
                 </p>
                 <p className="text-text-tertiary text-xs mt-2 font-mono">
                     Add transactions to see spending patterns
                 </p>
             </div>
         ) : (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-3 text-xs font-mono text-text-secondary text-left font-normal border-b border-border w-40">Category</th>
                            {MONTH_LABELS.map(m => (
                                <th key={m} className="p-2 text-xs font-mono text-text-secondary text-center font-normal border-b border-border">{m.substring(0, 1)}</th>
                            ))}
                            <th className="p-3 text-xs font-mono text-text-secondary text-right font-normal border-b border-border">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Object.entries(categoryMatrix) as [string, number[]][]).map(([category, months]) => {
                            const categoryTotal = months.reduce((sum, val) => sum + val, 0);
                            return (
                                <tr key={category} className="hover:bg-bg-surface-highlight transition-colors duration-150">
                                    <td className="p-3 text-sm font-sans font-medium text-text-primary border-b border-border">
                                        {category}
                                    </td>
                                    {months.map((val, mIndex) => (
                                        <td key={mIndex} className="p-1 border-b border-border">
                                            <div 
                                                className="w-full h-7 transition-all duration-150 cursor-pointer"
                                                onMouseEnter={() => setHoveredCell({ type: 'category', data: { category, month: MONTH_LABELS[mIndex], value: val } })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                                style={{ 
                                                    backgroundColor: val === 0 ? 'var(--color-bg-primary)' : getHeatColor(val, maxCategorySpend),
                                                    opacity: val === 0 ? 0.5 : 1
                                                }}
                                            />
                                        </td>
                                    ))}
                                    <td className="p-3 text-sm font-mono text-text-primary text-right border-b border-border">
                                        {formatCurrency(categoryTotal)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
         )}
      </div>

      {hoveredCell && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-bg-surface-highlight border border-border-strong px-4 py-3 z-50">
            {hoveredCell.type === 'daily' ? (
                <div className="font-mono text-sm">
                    <div className="text-text-primary font-medium">
                        {hoveredCell.data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-text-secondary mt-1">
                        {hoveredCell.data.value > 0 ? formatCurrency(hoveredCell.data.value) : 'No expenses'}
                    </div>
                </div>
            ) : (
                <div className="font-mono text-sm">
                    <div className="text-text-primary font-medium">
                        {hoveredCell.data.category}
                    </div>
                    <div className="text-text-secondary mt-1">
                        {hoveredCell.data.month}: {formatCurrency(hoveredCell.data.value)}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};