import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ActivityLogProvider, useActivityLog } from './context/ActivityLogContext';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { ActivityLogTrigger } from './components/ActivityLogTrigger';
import { ActivityLogPanel } from './components/ActivityLogPanel';
import { Dashboard } from './pages/Dashboard';
import { Wallets } from './pages/Wallets';
import { WalletDetails } from './pages/WalletDetails';
import { ExchangeStatus } from './pages/ExchangeStatus';
import { Settings } from './pages/Settings';
import { Activity } from './pages/Activity';
import { Landing } from './pages/Landing';
import { Analytics } from './pages/Analytics';
import { Recurring } from './pages/Recurring';
import { WalletSwitcher } from './components/WalletSwitcher';
import { AnimatePresence } from 'framer-motion';

// Navigation Tracker Component
const NavigationTracker = () => {
  const { logActivity } = useActivityLog();
  const { user } = useFinance();
  const location = useLocation();

  React.useEffect(() => {
    if (user) {
      logActivity('NAVIGATION', `Navigated to ${location.pathname}`, undefined, location.pathname);
    }
  }, [location.pathname, user]);

  return null;
};

// Top Bar for Desktop with Switcher
const DesktopTopBar = () => {
  return (
    <div className="hidden md:flex absolute top-0 left-0 right-0 h-20 items-center pointer-events-none z-40">
       <div className="flex-1" />
       <div className="pointer-events-auto">
         <WalletSwitcher />
       </div>
       <div className="flex-1 flex justify-end pr-8">
         <div className="pointer-events-auto">
           <ActivityLogTrigger />
         </div>
       </div>
    </div>
  );
};

// Mobile Top Bar
const MobileTopBar = () => {
  return (
    <div className="flex md:hidden fixed top-0 left-0 right-0 h-16 items-center justify-between bg-bg-surface/80 backdrop-blur-md border-b border-border z-40 px-4">
       <div className="pointer-events-auto">
         <WalletSwitcher />
       </div>
       <div className="pointer-events-auto">
         <ActivityLogTrigger />
       </div>
    </div>
  );
};

const ProtectedLayout: React.FC = () => {
  const { user } = useFinance();
  const location = useLocation();

  if (!user) {
      return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary selection:bg-accent selection:text-bg-primary">
      <NavigationTracker />
      <Sidebar />
      <div className="flex-1 md:ml-64 relative pb-24 md:pb-0">
         <MobileTopBar />
         <main className="pt-20 md:pt-0 min-h-screen relative">
            {/* Background Noise/Grid */}
            <div className="fixed inset-0 z-0 bg-radial-fade pointer-events-none" />
            
            <DesktopTopBar />

            <div className="relative z-10 pt-4 md:pt-16">
              <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/wallets" element={<Wallets />} />
                      <Route path="/wallet/:id" element={<WalletDetails />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/recurring" element={<Recurring />} />
                      <Route path="/exchange" element={<ExchangeStatus />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/activity" element={<Activity />} />
                  </Routes>
              </AnimatePresence>
            </div>
         </main>
      </div>
      <MobileNav />
      <ActivityLogPanel />
    </div>
  );
};

const AppContent: React.FC = () => {
    const { user } = useFinance();
    
    return (
        <Router>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Landing />} />
                <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
        </Router>
    );
}

const App: React.FC = () => {
  return (
    <ActivityLogProvider>
        <FinanceProvider>
            <AppContent />
        </FinanceProvider>
    </ActivityLogProvider>
  );
};

export default App;
