
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Navigation, 
  PlusCircle, 
  Trash2, 
  Wallet, 
  Settings, 
  Filter, 
  Search, 
  Maximize2, 
  Minimize2, 
  Download, 
  LogIn, 
  LogOut,
  X,
  Clock
} from 'lucide-react';
import { useActivityLog, ActivityType } from '../context/ActivityLogContext';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  NAVIGATION: <Navigation size={14} />,
  TRANSACTION_CREATE: <PlusCircle size={14} />,
  TRANSACTION_DELETE: <Trash2 size={14} />,
  WALLET_SWITCH: <Wallet size={14} />,
  SETTINGS_CHANGE: <Settings size={14} />,
  FILTER_APPLY: <Filter size={14} />,
  SEARCH: <Search size={14} />,
  MODAL_OPEN: <Maximize2 size={14} />,
  MODAL_CLOSE: <Minimize2 size={14} />,
  DATA_EXPORT: <Download size={14} />,
  LOGIN: <LogIn size={14} />,
  LOGOUT: <LogOut size={14} />,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  NAVIGATION: 'text-text-secondary',
  TRANSACTION_CREATE: 'text-positive',
  TRANSACTION_DELETE: 'text-negative',
  WALLET_SWITCH: 'text-accent',
  SETTINGS_CHANGE: 'text-text-secondary',
  FILTER_APPLY: 'text-text-secondary',
  SEARCH: 'text-text-secondary',
  MODAL_OPEN: 'text-text-secondary',
  MODAL_CLOSE: 'text-text-secondary',
  DATA_EXPORT: 'text-accent',
  LOGIN: 'text-positive',
  LOGOUT: 'text-negative',
};

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const ActivityLogPanel: React.FC = () => {
  const { activities, isOpen, togglePanel, closePanel, clearActivities } = useActivityLog();

  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activities.forEach(activity => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
    });
    return counts;
  }, [activities]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closePanel}
            className="fixed inset-0 bg-bg-primary/50 z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ 
                type: 'tween', 
                duration: 0.2, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="fixed right-0 top-0 h-full w-full sm:w-96 bg-bg-surface border-l border-border z-[70] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bg-surface-highlight border border-border flex items-center justify-center">
                    <ClipboardList size={16} className="text-text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-semibold text-text-primary">Activity Log</h2>
                    <p className="text-xs font-mono text-text-tertiary">{activities.length} entries</p>
                  </div>
                </div>
                <button
                  onClick={closePanel}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Close activity log"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Activity Type Summary */}
              {activities.length > 0 && (
                <div className="px-6 py-4 border-b border-border bg-bg-subtle">
                  <h3 className="text-xs font-mono text-text-tertiary mb-3">Activity Breakdown</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activityCounts)
                      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([type, count]) => (
                        <div 
                          key={type}
                          className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border"
                        >
                          <span className={ACTIVITY_COLORS[type as ActivityType]}>
                            {ACTIVITY_ICONS[type as ActivityType]}
                          </span>
                          <span className="text-xs font-mono text-text-secondary">{type.replace('_', ' ')}</span>
                          <span className="text-xs font-mono text-text-tertiary">×{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Activity List */}
              <div className="flex-1 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 px-6">
                    <div className="w-16 h-16 bg-bg-surface-highlight border border-border flex items-center justify-center mb-4">
                      <Clock size={24} className="text-text-tertiary" />
                    </div>
                    <p className="text-sm font-mono text-text-secondary text-center">No activity recorded yet</p>
                    <p className="text-xs font-mono text-text-tertiary text-center mt-2">
                      Interactions will appear here as you use the app
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-4 hover:bg-bg-surface-highlight transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 ${ACTIVITY_COLORS[activity.type]}`}>
                            {ACTIVITY_ICONS[activity.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-sans text-text-primary">
                                {activity.description}
                              </p>
                              <span className="text-xs font-mono text-text-tertiary whitespace-nowrap">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                            {activity.details && (
                              <p className="text-xs font-mono text-text-secondary mt-1">
                                {activity.details}
                              </p>
                            )}
                            {activity.page && (
                              <p className="text-xs font-mono text-text-tertiary mt-1">
                                Page: {activity.page}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {activities.length > 0 && (
                <div className="p-4 border-t border-border">
                  <button
                    onClick={clearActivities}
                    className="w-full px-4 py-2.5 text-xs font-mono text-text-secondary border border-border hover:border-border-strong hover:text-text-primary transition-colors"
                  >
                    Clear All Activity
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
