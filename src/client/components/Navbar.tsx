import React from 'react';
import { Layers, BarChart3, Box, History, Settings, Plus, Terminal, ExternalLink, Activity } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'catalog', label: 'Curriculum Catalog', code: '01', icon: Layers },
    { id: 'dashboard', label: 'Telemetry Bench', code: '02', icon: BarChart3 },
    { id: 'models', label: '3D Spatial Assets', code: '03', icon: Box },
    { id: 'sessions', label: 'Verification Logs', code: '04', icon: History },
    { id: 'settings', label: 'Diagnostics', code: '05', icon: Settings }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d0f16]/90 backdrop-blur-md border-b border-[#222634]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Mark — Precision Industrial Electronics Emblem */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group btn-tactile focus:outline-none cursor-pointer shrink-0"
          >
            {/* Ceramic DIP Package Emblem */}
            <div className="relative w-9 h-9 rounded-lg bg-[#14161f] border border-[#2e3447] flex items-center justify-center shadow-md group-hover:border-emerald-500/50 transition-colors">
              {/* DIP IC notch indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#272b3a] rounded-b-sm border-b border-x border-[#383e54]"></div>
              {/* Pin 1 silver dot */}
              <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-emerald-400 glow-phosphor-sm"></div>
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-white text-base tracking-wider uppercase">
                  AR·LAB
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1c202d] text-emerald-400 border border-emerald-500/30 tracking-widest">
                  REV·2.4
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#788199] tracking-tight uppercase">
                Digital Logic & WebXR Workstation
              </p>
            </div>
          </button>

          {/* Desktop Navigation — Segmented Industrial Rack Controls */}
          <nav className="hidden md:flex items-center bg-[#13151e] border border-[#232737] rounded-lg p-1 shadow-inner">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1e2230] text-emerald-300 font-semibold border border-[#343a4e] shadow-sm'
                      : 'text-[#8b95af] hover:text-[#e1e6f5] hover:bg-[#181a24] border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] ${isActive ? 'text-emerald-400 font-bold' : 'text-[#565d73]'}`}>
                    {item.code}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-[#707994]'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('create')}
              className="btn-tactile flex items-center gap-2 px-3.5 py-2 bg-gradient-to-b from-[#242938] to-[#181c26] hover:from-[#2e3447] hover:to-[#1e222f] text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/70 text-xs font-mono font-bold rounded-lg shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">AUTHOR EXPERIMENT</span>
            </button>

            <a
              href="https://github.com/ameydongre10/AR-lab"
              target="_blank"
              rel="noreferrer"
              title="GitHub Engineering Repository"
              className="p-2 text-[#8b95af] hover:text-white bg-[#14161f] border border-[#232737] hover:border-[#383e54] rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 bg-[#0a0c12] border-t border-[#1c1f2b] overflow-x-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[10px] font-mono transition-colors ${
                isActive ? 'text-emerald-400 font-bold' : 'text-[#707994]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
