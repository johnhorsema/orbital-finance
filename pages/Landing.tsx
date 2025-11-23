
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { Button } from '../components/ui/Button';
import { ArrowRight, Key, ShieldCheck, Download, Copy, Check, Upload, FileText, Terminal } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let success = false;
    if (loginMethod === 'CREDENTIALS') {
        success = await login(username, password);
    } else {
        success = await login(orbitKeyInput.trim());
    }

    if (!success) {
        setError('Authentication Failed: Invalid Credentials or Orbit Key.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.length < 3 || password.length < 4) {
        setError('Security Protocol: Username min 3 chars, Password min 4 chars.');
        return;
    }
    const key = await signup(username, password);
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
          // Fallback if they somehow lost state, though unlikely in this flow
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-void relative overflow-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-green" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-12 text-center">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-block"
            >
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-neon-green rotate-45" />
                    <h1 className="text-3xl font-bold text-white tracking-widest">ORBITAL</h1>
                </div>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.2em]">Decentralized Expense Telemetry</p>
            </motion.div>
        </div>

        <AnimatePresence mode="wait">
            {mode === 'INITIAL' && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                >
                    <button 
                        onClick={() => setMode('LOGIN')}
                        className="w-full group bg-surface hover:bg-surfaceHighlight border border-white/10 hover:border-neon-cyan/50 p-6 text-left transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-neon-cyan/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        <h3 className="text-white font-sans text-xl mb-1 relative z-10">Access Terminal</h3>
                        <p className="text-gray-500 text-xs font-mono relative z-10">Login via Orbit Key or Credentials</p>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="text-neon-cyan" />
                        </div>
                    </button>

                    <button 
                        onClick={() => setMode('SIGNUP')}
                        className="w-full group bg-surface hover:bg-surfaceHighlight border border-white/10 hover:border-neon-green/50 p-6 text-left transition-all duration-300 relative overflow-hidden"
                    >
                         <div className="absolute inset-0 bg-neon-green/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        <h3 className="text-white font-sans text-xl mb-1 relative z-10">Initialize Identity</h3>
                        <p className="text-gray-500 text-xs font-mono relative z-10">Create new secure ledger</p>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="text-neon-green" />
                        </div>
                    </button>
                    
                    <div className="pt-4 flex justify-center">
                        <button 
                            onClick={fillDemo}
                            className="flex items-center gap-2 text-gray-600 hover:text-neon-purple transition-colors text-xs font-mono uppercase tracking-wider"
                        >
                            <Terminal size={12} />
                            Launch Demo Mode
                        </button>
                    </div>
                </motion.div>
            )}

            {mode === 'LOGIN' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-surface border border-white/10 p-8 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl text-white font-sans">Authenticate</h2>
                        <button onClick={reset} className="text-xs font-mono text-gray-500 hover:text-white">BACK</button>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <button 
                            onClick={() => { setLoginMethod('CREDENTIALS'); setError(''); }}
                            className={`flex-1 py-2 text-xs font-mono border-b-2 transition-colors ${loginMethod === 'CREDENTIALS' ? 'border-neon-cyan text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                        >
                            Credentials
                        </button>
                        <button 
                            onClick={() => { setLoginMethod('KEY'); setError(''); }}
                            className={`flex-1 py-2 text-xs font-mono border-b-2 transition-colors ${loginMethod === 'KEY' ? 'border-neon-cyan text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
                        >
                            Orbit Key
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {loginMethod === 'CREDENTIALS' ? (
                            <>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Username</label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-cyan focus:outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Orbit Key Hash</label>
                                    <textarea 
                                        value={orbitKeyInput}
                                        onChange={(e) => setOrbitKeyInput(e.target.value)}
                                        className="w-full h-24 bg-black border border-white/10 p-3 text-white font-mono text-xs focus:border-neon-cyan focus:outline-none resize-none"
                                        placeholder="Paste your key string here..."
                                        autoFocus
                                    />
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <div className="h-px bg-white/10 flex-1" />
                                    <span className="text-[10px] text-gray-600 font-mono">OR</span>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>

                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".txt" 
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
                            <div className="text-red-500 text-xs font-mono bg-red-900/10 p-2 border border-red-900/30">
                                {error}
                            </div>
                        )}

                        <Button variant="neon" className="w-full mt-4">
                            Connect
                        </Button>
                    </form>
                </motion.div>
            )}

            {mode === 'SIGNUP' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-surface border border-white/10 p-8 shadow-2xl"
                >
                    {!generatedKey ? (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl text-white font-sans">Establish Identity</h2>
                                <button onClick={reset} className="text-xs font-mono text-gray-500 hover:text-white">BACK</button>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Desired Username</label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-1">Secure Password</label>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black border border-white/10 p-3 text-white font-mono focus:border-neon-green focus:outline-none"
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-xs font-mono bg-red-900/10 p-2 border border-red-900/30">
                                        {error}
                                    </div>
                                )}

                                <Button variant="neon" className="w-full mt-4">
                                    Generate Orbit Key
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-neon-green/10 rounded-full text-neon-green border border-neon-green/20 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                                    <ShieldCheck size={48} />
                                </div>
                            </div>
                            <h2 className="text-2xl text-white font-sans mb-2">Identity Secured</h2>
                            <p className="text-gray-500 text-xs font-mono mb-6">
                                Your unique Orbit Key has been generated. <br/>
                                Store this file securely. It can be used to recover access.
                            </p>

                            <div className="bg-black border border-white/10 p-4 rounded mb-6 relative group">
                                <code className="text-[10px] text-neon-green font-mono break-all leading-relaxed opacity-80">
                                    {generatedKey}
                                </code>
                                <button 
                                    onClick={copyToClipboard}
                                    className="absolute top-2 right-2 p-1 bg-white/10 rounded hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Copy"
                                >
                                    <Copy size={12} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <Button onClick={handleDownload} variant="secondary" className="w-full" icon={<Download size={16} />}>
                                    Download Key File
                                </Button>
                                <Button onClick={handleEnterDashboard} variant="neon" className="w-full">
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
