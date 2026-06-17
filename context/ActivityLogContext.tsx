
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ActivityType = 
  | 'NAVIGATION'
  | 'TRANSACTION_CREATE'
  | 'TRANSACTION_DELETE'
  | 'WALLET_SWITCH'
  | 'SETTINGS_CHANGE'
  | 'FILTER_APPLY'
  | 'SEARCH'
  | 'MODAL_OPEN'
  | 'MODAL_CLOSE'
  | 'DATA_EXPORT'
  | 'LOGIN'
  | 'LOGOUT';

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  description: string;
  details?: string;
  page?: string;
}

interface ActivityLogContextType {
  activities: ActivityEntry[];
  logActivity: (type: ActivityType, description: string, details?: string, page?: string) => void;
  clearActivities: () => void;
  isOpen: boolean;
  hasUnviewed: boolean;
  togglePanel: () => void;
  closePanel: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  if (!context) {
    throw new Error('useActivityLog must be used within ActivityLogProvider');
  }
  return context;
};

interface ActivityLogProviderProps {
  children: ReactNode;
}

export const ActivityLogProvider: React.FC<ActivityLogProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnviewed, setHasUnviewed] = useState(false);

  const logActivity = useCallback((type: ActivityType, description: string, details?: string, page?: string) => {
    const entry: ActivityEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      details,
      page,
    };
    
    setActivities(prev => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    setHasUnviewed(true);
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState) setHasUnviewed(false); // Clear blip when opening
      return newState;
    });
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ActivityLogContext.Provider value={{ 
      activities, 
      logActivity, 
      clearActivities,
      isOpen,
      hasUnviewed,
      togglePanel,
      closePanel
    }}>
      {children}
    </ActivityLogContext.Provider>
  );
};
