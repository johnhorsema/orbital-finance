
import React from 'react';
import { ClipboardList } from 'lucide-react';
import { useActivityLog } from '../context/ActivityLogContext';

export const ActivityLogTrigger: React.FC = () => {
  const { togglePanel, hasUnviewed } = useActivityLog();

  return (
    <button
      onClick={togglePanel}
      className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      aria-label="Open activity log"
      title="Activity Log"
    >
      <ClipboardList size={20} />
      {hasUnviewed && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent" />
      )}
    </button>
  );
};
