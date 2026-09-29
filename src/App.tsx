import React, { useState, useEffect } from 'react';
import {
  Menu, X, Bot, ShieldCheck, Settings as SettingsIcon,
  BarChart2, Home, Zap, ExternalLink
} from 'lucide-react';
import { derivService } from './derivService';
import { tradingEngine } from './tradingEngine';

type PageView = 'dashboard' | 'analysis' | 'signals' | 'denny' | 'automated' | 'autod' | 'settings';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);

  const [autodUnlocked, setAutodUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isBotRunning, setIsBotRunning] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token1');
    if (token) derivService.connect(token);

    const subConn = derivService.isConnected$.subscribe(setIsConnected);
    const subBal = derivService.balance$.subscribe(setBalance);
    const subTick = derivService.ticks$.subscribe(tick => {
      if (tick) tradingEngine.addTick(tick.digit);
    });
    return () => {
      subConn.unsubscribe();
      subBal.unsubscribe();
      subTick.unsubscribe();
    };
  }, []);

  const handleConnectDeriv = () => {
    window.location.href = derivService.getAuthUrl();
  };

  const handleUnlockAutoD = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Denny@1249') {
      setAutodUnlocked(true);
    }
  };

  const runAnalysis = () => {
    derivService.subscribeTicks('R_100');
    tradingEngine.analyzeMarket('R_100', 'Digits', 'Over/Under', 'Over 2');
  };

  const toggleBot = () => {
    setIsBotRunning(!isBotRunning);
  };

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0E14] text-slate-100 overflow-hidden select-none">
      <header className="h-14 bg-[#12161F] border-b border-slate-800 flex items-center justify-between px-4 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setDrawerOpen(!drawerOpen)} className="p-2 text-slate-300 hover:text-[#FF6B00] bg-slate-800/50 rounded-lg cursor-pointer">
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-extrabold text-sm md:text-lg tracking-wider bg-gradient-to-r from-[#FF6B00] via-[#00E676] to-[#00B0FF] bg-clip-text text-transparent">
            MWATHE TRADE SYSTEMS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#12161F] px-3 py-1.5 rounded-full border border-slate-800">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-[#00E676]' : 'bg-red-500'}`} />
            <span className="text-xs text-slate-400 font-bold">{isConnected ? 'OAuth Active' : 'Offline'}</span>
          </div>
          <div className="bg-[#12161F] border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <div className="text-[10px] text-slate-400">BALANCE</div>
            <div className="text-sm font-bold text-[#00E676]">${balance.toFixed(2)}</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {drawerOpen && <div className="absolute inset-0 bg-black/60 z-30" onClick={() => setDrawerOpen(false)} />}

        <aside className={`absolute top-0 left-0 h-full w-64 bg-[#12161F] border-r border-slate-800 z-40 transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex flex-col gap-2">
            <button onClick={() => navigateTo('dashboard')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${currentPage === 'dashboard' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-slate-400'}`}>
              <Home size={18} /> Central Dashboard
            </button>
            <button onClick={() => navigateTo('analysis')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${currentPage === 'analysis' ? 'bg-[#00B0FF]/10 text-[#00B0FF]' : 'text-slate-400'}`}>
              <BarChart2 size={18} /> Analysis Tool
            </button>
            <button onClick={() => navigateTo('denny')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${currentPage === 'denny' ? 'bg-[#00E676]/10 text-[#00E676]' : 'text-slate-400'}`}>
              <Bot size={18} /> Denny Bots
            </button>
            <button onClick={() => navigateTo('autod')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${currentPage === 'autod' ? 'bg-[#FF6B00]/10 text-[#FF6B00]' : 'text-slate-400'}`}>
              <ShieldCheck size={18} /> AutoD AI Suite
            </button>
            <button onClick={() => navigateTo('settings')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm cursor-pointer ${currentPage === 'settings' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}`}>
              <SettingsIcon size={18} /> Settings & API
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 overflow-y-auto bg-[#0B0E14]">
          {currentPage === 'dashboard' && (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-6">
              <div className="bg-[#12161F] p-6 rounded-2xl border border-slate-800 w-full shadow-xl">
                <h1 className="text-2xl font-black mb-2 bg-gradient-to-r from-[#FF6B00] via-[#00E676] to-[#00B0FF] bg-clip-text text-transparent">
                  MWATHE TRADE SYSTEMS
                </h1>
                <p className="text-xs text-slate-400 mb-6">
                  High-frequency algorithmic trading platform integrated with Deriv API WebSocket streams and secure OAuth 2.0 authentication.
                </p>

                <div className="flex flex-col gap-3">
                  <button onClick={handleConnectDeriv} className="w-full py-3.5 bg-[#00E676] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer">
                    Connect with Deriv <ExternalLink size={16} />
                  </button>
                  <button onClick={() => navigateTo('analysis')} className="w-full py-3.5 bg-[#00B0FF] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                    <BarChart2 size={16} /> Open Analysis Tool
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'analysis' && (
            <div className="bg-[#12161F] p-4 rounded-xl border border-slate-800 max-w-lg mx-auto">
              <div className="font-bold text-base mb-3 text-[#00B0FF] flex items-center gap-2"><BarChart2 size={18} /> Analysis Page</div>
              <button onClick={runAnalysis} className="w-full py-3 bg-[#00B0FF] text-black font-extrabold text-xs rounded-xl cursor-pointer">Execute Market Scan</button>
            </div>
          )}

          {currentPage === 'denny' && (
            <div className="bg-[#12161F] p-4 rounded-xl border border-slate-800 max-w-lg mx-auto">
              <div className="font-bold text-base mb-2 text-[#00E676] flex items-center gap-2"><Bot size={18} /> Denny Bots Page</div>
              <button onClick={toggleBot} className="w-full py-3 bg-[#00E676] text-black font-extrabold text-xs rounded-xl cursor-pointer">{isBotRunning ? 'Stop' : 'Start'} Denny Bot</button>
            </div>
          )}

          {currentPage === 'autod' && (
            <div className="bg-[#12161F] p-4 rounded-xl border border-slate-800 max-w-sm mx-auto">
              {!autodUnlocked ? (
                <form onSubmit={handleUnlockAutoD} className="flex flex-col gap-3">
                  <div className="text-xs font-bold text-[#FF6B00] uppercase">AutoD AI Protected Suite</div>
                  <input type="password" placeholder="Enter Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="bg-[#0B0E14] border border-slate-800 text-center p-2 text-xs rounded-lg text-slate-100" />
                  <button type="submit" className="py-2.5 bg-[#FF6B00] text-black font-extrabold text-xs rounded-lg cursor-pointer">Authenticate</button>
                </form>
              ) : (
                <div>
                  <div className="font-bold text-[#FF6B00] mb-2 flex items-center gap-2"><ShieldCheck size={18} /> AutoD AI Iron Recovery</div>
                  <button onClick={toggleBot} className="w-full py-2.5 bg-[#FF6B00] text-black font-extrabold text-xs rounded-lg cursor-pointer">Run Iron Recovery Bot</button>
                </div>
              )}
            </div>
          )}

          {currentPage === 'settings' && (
            <div className="bg-[#12161F] p-4 rounded-xl border border-slate-800 max-w-sm mx-auto flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-200 uppercase">OAuth Connection</div>
              <button onClick={handleConnectDeriv} className="py-3 px-4 bg-[#00E676] text-black font-extrabold text-xs rounded-xl cursor-pointer">Connect Deriv OAuth</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
