
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { Button } from '../components/ui/Button';
import { ArrowRight, Key, ShieldCheck, Download, Copy, Upload, FileText, Terminal, ArrowLeft } from 'lucide-react';
import { downloadKey } from '../utils/crypto';

export const Landing: React.FC = () => {
  const { login, signup } = useFinance();
  const [mode, setMode] = useState<'INITIAL' | 'LOGIN' | 'SIGNUP'>('INITIAL');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orbitKeyInput, setOrbitKeyInput] = useState('');
  const [loginMethod, setLoginMethod] = useState<'CREDENTIALS' | 'KEY'>('CREDENTIALS');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    let success = false;
    if (loginMethod === 'CREDENTIALS') {
        success = await login(username, password);
    } else {
        success = await login(orbitKeyInput.trim());
    }

    setIsLoading(false);
    if (!success) {
        setError('Invalid credentials or orbit key.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (username.length < 3 || password.length < 4) {
        setError('Username requires 3+ characters. Password requires 4+ characters.');
        return;
    }
    
    setIsLoading(true);
    const key = await signup(username, password);
    setIsLoading(false);
    setGeneratedKey(key);
  };

  const handleDownload = () => {
      if (generatedKey) {
          downloadKey(username, generatedKey);
      }
  };

  const handleEnterDashboard = async () => {
      if (username && password) {
          await login(username, password);
      } else {
          setMode('LOGIN'); 
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
            setOrbitKeyInput(text.trim());
            setError('');
        }
      };
      reader.readAsText(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const copyToClipboard = () => {
      if (generatedKey) {
          navigator.clipboard.writeText(generatedKey);
      }
  };

  const reset = () => {
      setMode('INITIAL');
      setUsername('');
      setPassword('');
      setOrbitKeyInput('');
      setGeneratedKey(null);
      setError('');
  };

  const fillDemo = () => {
      setMode('LOGIN');
      setLoginMethod('CREDENTIALS');
      setUsername('demo');
      setPassword('demo');
  };

  const transitionProps = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Subtle background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      {/* Accent line at top */}
      <div className="absolute top-0 left-0 w-full h-px bg-accent/20" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Brand header */}
        <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 text-center"
        >
            <div className="inline-flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-accent" />
                <h1 className="text-2xl font-sans font-semibold text-text-primary tracking-tight">ORBITAL</h1>
            </div>
            <p className="text-text-tertiary font-mono text-xs uppercase tracking-wider">Decentralized Expense Telemetry</p>
        </motion.div>

        <AnimatePresence mode="wait">
            {mode === 'INITIAL' && (
                <motion.div 
                    {...transitionProps}
                    key="initial"
                    className="space-y-3"
                >
                    <button 
                        onClick={() => setMode('LOGIN')}
                        className="w-full group bg-bg-surface hover:bg-bg-surface-highlight border border-border hover:border-accent/50 p-5 text-left transition-all duration-150 ease-out-expo"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-text-primary font-sans text-base font-medium mb-1">Access Terminal</h3>
                                <p className="text-text-tertiary text-xs font-mono">Login via credentials or orbit key</p>
                            </div>
                            <ArrowRight className="text-text-tertiary group-hover:text-accent transition-colors" size={18} />
                        </div>
                    </button>

                    <button 
                        onClick={() => setMode('SIGNUP')}
                        className="w-full group bg-bg-surface hover:bg-bg-surface-highlight border border-border hover:border-accent/50 p-5 text-left transition-all duration-150 ease-out-expo"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-text-primary font-sans text-base font-medium mb-1">Create Identity</h3>
                                <p className="text-text-tertiary text-xs font-mono">Generate new orbit key</p>
                            </div>
                            <ArrowRight className="text-text-tertiary group-hover:text-accent transition-colors" size={18} />
                        </div>
                    </button>
                    
                    <div className="pt-4 flex justify-center">
                        <button 
                            onClick={fillDemo}
                            className="inline-flex items-center gap-2 text-text-tertiary hover:text-accent transition-colors text-xs font-mono uppercase tracking-wider"
                        >
                            <Terminal size={12} />
                            Launch Demo
                        </button>
                    </div>
                </motion.div>
            )}

            {mode === 'LOGIN' && (
                <motion.div
                    {...transitionProps}
                    key="login"
                    className="bg-bg-surface border border-border"
                >
                    <div className="flex justify-between items-center p-5 border-b border-border">
                        <h2 className="text-base text-text-primary font-sans font-medium">Authenticate</h2>
                        <button 
                            onClick={reset} 
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Back
                        </button>
                    </div>

                    <div className="px-5 pt-4">
                        <div className="flex gap-0 border-b border-border">
                            <button 
                                onClick={() => { setLoginMethod('CREDENTIALS'); setError(''); }}
                                className={`flex-1 pb-3 text-xs font-mono border-b-2 transition-colors ${loginMethod === 'CREDENTIALS' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
                            >
                                Credentials
                            </button>
                            <button 
                                onClick={() => { setLoginMethod('KEY'); setError(''); }}
                                className={`flex-1 pb-3 text-xs font-mono border-b-2 transition-colors ${loginMethod === 'KEY' ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}
                            >
                                Orbit Key
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="p-5 space-y-4">
                        {loginMethod === 'CREDENTIALS' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">Username</label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                                        placeholder="Enter username"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                                        placeholder="Enter password"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">Orbit Key</label>
                                    <textarea 
                                        value={orbitKeyInput}
                                        onChange={(e) => setOrbitKeyInput(e.target.value)}
                                        className="w-full h-24 bg-bg-primary border border-border p-3 text-text-primary font-mono text-xs focus:border-accent focus:outline-none resize-none transition-colors"
                                        placeholder="Paste your orbit key here..."
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="flex items-center gap-3 py-1">
                                    <div className="h-px bg-border flex-1" />
                                    <span className="text-xs text-text-tertiary font-mono">or</span>
                                    <div className="h-px bg-border flex-1" />
                                </div>

                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".txt,.key" 
                                    onChange={handleFileUpload} 
                                />
                                <Button 
                                    type="button" 
                                    onClick={triggerFileUpload} 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full border-dashed"
                                    icon={<Upload size={14} />}
                                >
                                    Upload Key File
                                </Button>
                            </div>
                        )}

                        {error && (
                            <div className="text-negative text-xs font-mono bg-negative/5 p-3 border border-negative/20">
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Connecting...' : 'Connect'}
                        </Button>
                    </form>
                </motion.div>
            )}

            {mode === 'SIGNUP' && (
                <motion.div
                    {...transitionProps}
                    key="signup"
                    className="bg-bg-surface border border-border"
                >
                    {!generatedKey ? (
                        <>
                             <div className="flex justify-between items-center p-5 border-b border-border">
                                <h2 className="text-base text-text-primary font-sans font-medium">Create Identity</h2>
                                <button 
                                    onClick={reset} 
                                    className="inline-flex items-center gap-1.5 text-xs font-mono text-text-tertiary hover:text-text-primary transition-colors"
                                >
                                    <ArrowLeft size={12} />
                                    Back
                                </button>
                            </div>

                            <form onSubmit={handleSignup} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">Username</label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                                        placeholder="Choose a username"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-text-tertiary uppercase mb-2">Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-bg-primary border border-border p-3 text-text-primary font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                                        placeholder="Choose a password"
                                    />
                                </div>

                                {error && (
                                    <div className="text-negative text-xs font-mono bg-negative/5 p-3 border border-negative/20">
                                        {error}
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="w-full"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Generating...' : 'Generate Orbit Key'}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-center mb-5">
                                <div className="p-3 bg-accent/10 border border-accent/20">
                                    <ShieldCheck size={32} className="text-accent" />
                                </div>
                            </div>
                            <h2 className="text-xl text-text-primary font-sans font-semibold mb-2 text-center">Identity Secured</h2>
                            <p className="text-text-secondary text-sm font-sans mb-6 text-center leading-relaxed">
                                Your orbit key has been generated. Store this file securely. It can be used to recover access.
                            </p>

                            <div className="bg-bg-primary border border-border p-4 mb-6 relative group">
                                <code className="text-xs text-accent font-mono break-all leading-relaxed block pr-8">
                                    {generatedKey}
                                </code>
                                <button 
                                    onClick={copyToClipboard}
                                    className="absolute top-3 right-3 p-1.5 bg-bg-surface border border-border hover:border-accent/50 text-text-tertiary hover:text-accent transition-all"
                                    title="Copy to clipboard"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <Button onClick={handleDownload} variant="secondary" className="w-full" icon={<Download size={16} />}>
                                    Download Key File
                                </Button>
                                <Button onClick={handleEnterDashboard} variant="primary" className="w-full">
                                    Enter Dashboard
                                </Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};