
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';
import { Activity, Server, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, Clock, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ExchangeStatus: React.FC = () => {
  const { rates, rateStatus, refreshRates, globalCurrency } = useFinance();
  const [displayCount, setDisplayCount] = useState(24);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'primary':
        return { color: 'text-positive', bg: 'bg-positive/10', label: 'Primary Node', icon: CheckCircle2 };
      case 'fallback':
        return { color: 'text-warning', bg: 'bg-warning/10', label: 'Fallback Node', icon: AlertTriangle };
      case 'cache':
        return { color: 'text-text-secondary', bg: 'bg-bg-surface-highlight', label: 'Local Cache', icon: Clock };
      default:
        return { color: 'text-negative', bg: 'bg-negative/10', label: 'Disconnected', icon: AlertTriangle };
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 48);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshRates();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const totalRates = Object.keys(rates).length;
  const statusConfig = getStatusConfig(rateStatus.source);
  const StatusIcon = statusConfig.icon;

  const majorCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny', 'hkd', 'sgd', 'krw', 'inr', 'btc', 'eth'];
  const majorRates = Object.entries(rates)
    .filter(([curr]) => majorCurrencies.includes(curr.toLowerCase()))
    .slice(0, 8);

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl md:text-5xl font-sans font-medium tracking-tight text-text-primary">
          Exchange Rates
        </h1>
        <p className="text-text-secondary mt-2 font-mono text-sm">
          Live connection status and pricing feeds from global currency APIs. Rates update automatically with failover protection.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-2 bg-bg-surface border border-border p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-none ${statusConfig.bg}`}>
                <StatusIcon size={18} className={statusConfig.color} />
              </div>
              <div>
                <h2 className="text-text-primary font-sans text-sm font-medium">Connection Status</h2>
                <div className={`font-mono text-xs uppercase mt-0.5 ${statusConfig.color}`}>
                  {statusConfig.label}
                </div>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />}
            >
              Resync
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="border-t border-border pt-4">
              <div className="text-text-tertiary font-mono text-xs uppercase mb-1">Base Currency</div>
              <div className="text-text-primary font-mono text-sm">{globalCurrency}</div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-text-tertiary font-mono text-xs uppercase mb-1">Total Pairs</div>
              <div className="text-text-primary font-mono text-sm">{totalRates}</div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-text-tertiary font-mono text-xs uppercase mb-1">Last Updated</div>
              <div className="text-text-primary font-mono text-sm">
                {rateStatus.lastUpdated
                  ? rateStatus.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Never'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Protocol Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="bg-bg-surface border border-border p-6"
        >
          <h3 className="text-text-primary font-sans text-sm font-medium mb-4 flex items-center gap-2">
            <Server size={14} className="text-text-secondary" />
            Data Source
          </h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-positive mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-text-primary">Primary</div>
                <div className="text-text-tertiary">cdn.jsdelivr.net</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-warning mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-text-primary">Fallback</div>
                <div className="text-text-tertiary">currency-api.pages.dev</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-text-secondary mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-text-primary">Cache</div>
                <div className="text-text-tertiary">1 hour validity</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Key Rates */}
      {majorRates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <h3 className="text-text-secondary font-mono text-xs uppercase tracking-wider mb-4">Key Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {majorRates.map(([curr, val]) => (
              <div key={curr} className="bg-bg-surface border border-border p-4">
                <div className="text-text-tertiary font-mono text-xs uppercase mb-1">{curr.toUpperCase()}</div>
                <div className="text-text-primary font-mono text-sm">
                  {(val as number).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Rates Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-secondary font-mono text-xs uppercase tracking-wider">
            All Pairs ({totalRates})
          </h3>
          <div className="text-xs text-text-tertiary font-mono">
            Showing {Math.min(displayCount, totalRates)} of {totalRates}
          </div>
        </div>

        <div className="bg-bg-surface border border-border divide-y divide-border">
          {Object.entries(rates)
            .slice(0, displayCount)
            .map(([curr, val]) => (
              <div
                key={curr}
                className="flex items-center justify-between px-4 py-3 hover:bg-bg-surface-highlight transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe size={14} className="text-text-tertiary" />
                  <span className="text-text-primary font-mono text-sm uppercase">{curr}</span>
                </div>
                <span className="text-text-primary font-mono text-sm">
                  {(val as number).toFixed(6)}
                </span>
              </div>
            ))}
        </div>

        {displayCount < totalRates && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleLoadMore}
              variant="secondary"
              icon={<ChevronDown size={14} />}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};