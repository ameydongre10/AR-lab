import React from 'react';
import { Terminal, ShieldCheck, ExternalLink, Cpu, Activity, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0c12] border-t border-[#1f2230] text-[#7d869e] py-12 mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Spec Sheet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 pb-10 border-b border-[#1b1e2a]">
          
          {/* Left Column: Calibration Plate */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#161822] border border-[#2b3044] flex items-center justify-center text-emerald-400">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-white text-sm tracking-wider uppercase">
                AR·LAB // PRECISION HARDWARE WORKBENCH
              </span>
            </div>

            <p className="text-xs text-[#828c9f] leading-relaxed max-w-sm">
              Deterministic 3-valued fixpoint digital logic engine and spatial WebXR circuit laboratory. Designed for university electrical engineering programs to simulate TTL 7400 IC pinouts, SOP/POS canonical logic forms, and solderless breadboard wire harnesses in real physical dimensions.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#131722] text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                FIXPOINT SOLVER: DETERMINISTIC
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#131722] text-[#939db5] border border-[#262c3e]">
                TI-7400 DATASHEET SPEC
              </span>
            </div>
          </div>

          {/* Middle Column: Supported IC Packages & Subsystems */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-white">
              [ 01 // CALIBRATED LOGIC PACKAGES ]
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-[#11131a] border border-[#1e2230]">
                <div className="text-white font-bold">SN7404N</div>
                <div className="text-[10px] text-[#6d768e]">Hex Inverter (NOT)</div>
                <div className="text-[9px] text-emerald-400 mt-1">t_pd: 9ns • 14-DIP</div>
              </div>
              <div className="p-2 rounded bg-[#11131a] border border-[#1e2230]">
                <div className="text-white font-bold">SN7408N</div>
                <div className="text-[10px] text-[#6d768e]">Quad 2-In AND</div>
                <div className="text-[9px] text-emerald-400 mt-1">t_pd: 15ns • 14-DIP</div>
              </div>
              <div className="p-2 rounded bg-[#11131a] border border-[#1e2230]">
                <div className="text-white font-bold">SN7432N</div>
                <div className="text-[10px] text-[#6d768e]">Quad 2-In OR</div>
                <div className="text-[9px] text-emerald-400 mt-1">t_pd: 14ns • 14-DIP</div>
              </div>
              <div className="p-2 rounded bg-[#11131a] border border-[#1e2230]">
                <div className="text-white font-bold">MB-102 BREADBOARD</div>
                <div className="text-[10px] text-[#6d768e]">830 Tie-Points</div>
                <div className="text-[9px] text-blue-400 mt-1">Dual Rails (VCC/GND)</div>
              </div>
            </div>
          </div>

          {/* Right Column: Engineering Repos & Diagnostics */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-white">
              [ 02 // LAB TELEMETRY & AUDIT ]
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a
                  href="https://github.com/ameydongre10/AR-lab"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#9ba5bc] hover:text-white transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#5e667d]" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#9ba5bc] hover:text-emerald-400 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-[#5e667d]" />
                  <span>Diagnostics JSON Stream</span>
                </a>
              </li>
              <li>
                <a
                  href="/api/experiments"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#9ba5bc] hover:text-emerald-400 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-[#5e667d]" />
                  <span>Curriculum REST Endpoint</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Lower Calibration Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5f677d]">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} AR LAB WORKBENCH</span>
            <span>•</span>
            <span>MIT LICENSE</span>
            <span>•</span>
            <span className="text-[#848fa7]">RELEASE V2.4.0</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>CALIBRATION: ACTIVE</span>
            <span>•</span>
            <span>STATION ID: AR-NODE-01</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
