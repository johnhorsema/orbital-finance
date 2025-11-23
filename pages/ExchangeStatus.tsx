
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';
import { Activity, Server, RefreshCw, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ExchangeStatus: React.FC = () => {
  const { rates, rateStatus, refreshRates, globalCurrency } = useFinance();
  const [displayCount, setDisplayCount] = useState(24);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'primary': return 'text-neon-green';
      case 'fallback': return 'text-yellow-500';
      case 'cache': return 'text-blue-400';
      default: return 'text-red-500';
    }
  };

  const handleLoadMore = () => {
      setDisplayCount(prev => prev + 48);
  };

  const totalRates = Object.keys(rates).length;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-12 border-b border-white/5 pb-8">
        <h1 className="text-4xl font-sans font-light text-white tracking-tighter mb-4">
          MARKET <span className="text-neon-cyan font-bold">UPLINK</span>
        </h1>
        <p className="text-gray-400 font-mono max-w-2xl">
          Real-time connection status to global exchanges. This interface monitors the integrity of the pricing feeds used for wallet valuation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-white/10 p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Server size={100} />
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-full bg-white/5 ${getStatusColor(rateStatus.source)}`}>
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-white font-sans text-lg">Connection Status</h2>
              <div className={`font-mono text-sm uppercase ${getStatusColor(rateStatus.source)}`}>
                {rateStatus.source === 'error' ? 'Disconnected' : 'Active'}
              </div>
            </div>
          </div>

          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-500">Source</span>
              <span className="text-white capitalize">{rateStatus.source} Node</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-500">Base Currency</span>
              <span className="text-white">{globalCurrency}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-gray-500">Last Sync</span>
              <span className="text-white">
                {rateStatus.lastUpdated ? rateStatus.lastUpdated.toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Button onClick={() => refreshRates()} variant="secondary" className="w-full" icon={<RefreshCw size={16} />}>
              Force Resync
            </Button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface/50 border border-dashed border-white/10 p-8 flex flex-col justify-center"
        >
          <h3 className="text-white font-sans text-lg mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-neon-pink" />
            Protocol Details
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            Rates are sourced via <span className="text-white font-mono">@fawazahmed0/currency-api</span>.
            The system implements a failover mechanism:
          </p>
          <ul className="space-y-2 text-sm text-gray-500 font-mono">
             <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-neon-green" />
                <span>Primary: cdn.jsdelivr.net (Edge)</span>
             </li>
             <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-yellow-500" />
                <span>Fallback: currency-api.pages.dev</span>
             </li>
             <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-blue-400" />
                <span>Local Cache: 1 Hour validity</span>
             </li>
          </ul>
        </motion.div>
      </div>

      {/* Raw Rates View */}
      <div className="flex items-end justify-between mb-6">
         <h3 className="text-white font-mono uppercase tracking-widest">Live Feed ({totalRates} pairs)</h3>
         <div className="text-xs text-gray-500 font-mono">
            Showing {Math.min(displayCount, totalRates)} of {totalRates}
         </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
         {Object.entries(rates).slice(0, displayCount).map(([curr, val], i) => (
           <motion.div 
             key={curr}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.05 }}
             className="bg-black border border-white/5 p-4 hover:border-neon-cyan/30 transition-colors"
           >
             <div className="text-gray-500 text-xs font-mono uppercase mb-1">{curr}</div>
             <div className="text-white font-mono text-sm truncate">{val.toFixed(4)}</div>
           </motion.div>
         ))}
      </div>

      {displayCount < totalRates && (
          <div className="flex justify-center">
              <Button onClick={handleLoadMore} variant="secondary" icon={<ChevronDown size={16} />}>
                  Load More Pairs
              </Button>
          </div>
      )}
    </div>
  );
};
