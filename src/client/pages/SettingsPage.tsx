import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Terminal, ShieldCheck, Cpu, Smartphone, Server, ExternalLink, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [hasWebXr, setHasWebXr] = useState<boolean>(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    api.getHealth()
      .then(res => setHealthData(res))
      .catch(err => setHealthData({ status: 'error', error: err.message }));

    if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((sup: boolean) => setHasWebXr(sup));
    }

    setUserAgent(navigator.userAgent);
  }, []);

  return (
    <div className="space-y-8 pb-16 font-mono">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#202535]">
        <div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
            [ DIAGNOSTICS & TELEMETRY // SYSTEM CALIBRATION ]
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Hardware & Platform Diagnostics
          </h1>
          <p className="text-xs text-[#828ca1] mt-1 font-sans">
            Telemetry, WebXR hardware detection, REST API status, and environment configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Backend & DB Health Card */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1f2231]">
            <Server className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              BACKEND SERVER & PERSISTENCE SUBSYSTEM
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#1b1e2b]">
              <span className="text-[#717a94]">Server Telemetry:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {healthData?.status?.toUpperCase() || 'ONLINE'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1b1e2b]">
              <span className="text-[#717a94]">Continuous Uptime:</span>
              <span className="text-white font-bold">{healthData?.uptime ? `${Math.round(healthData.uptime)}s` : 'Active'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1b1e2b]">
              <span className="text-[#717a94]">Platform Spec:</span>
              <span className="text-emerald-300 font-bold">v{healthData?.version || '2.4.0'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#717a94]">Persistence Engine:</span>
              <span className="text-[#cfd6e7]">ACID Atomic Storage Store</span>
            </div>
          </div>
        </div>

        {/* Client & WebXR Spatial Diagnostics */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2.5 border-b border-[#1f2231]">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              CLIENT WORKSTATION & SPATIAL PROFILE
            </h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#1b1e2b]">
              <span className="text-[#717a94]">WebXR Immersive-AR:</span>
              <span className={hasWebXr ? 'text-emerald-400 font-bold' : 'text-[#8892aa]'}>
                {hasWebXr ? 'SUPPORTED (ARKit/ARCore)' : 'STANDBY / DESKTOP EMULATION'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1b1e2b]">
              <span className="text-[#717a94]">Android Scene Viewer:</span>
              <span className="text-emerald-300 font-bold">ENABLED (INTENT PROTOCOL)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1b1e2b]">
              <span className="text-[#717a94]">Apple AR Quick Look:</span>
              <span className="text-emerald-300 font-bold">ENABLED (REL="AR")</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#717a94]">3D Render Core:</span>
              <span className="text-[#cfd6e7]">@google/model-viewer v4.4.0 (WebGL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* REST API Explorer */}
      <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="pb-2.5 border-b border-[#1f2231]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            [ ENDPOINT REGISTRY // REST API SPEC ]
          </h2>
          <p className="text-xs text-[#7d879e] mt-1 font-sans">
            Automated JSON interfaces for curriculum data, Boolean circuit simulation, and 3D spatial models:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { method: 'GET', path: '/api/experiments', desc: 'List & search experiments with pagination' },
            { method: 'POST', path: '/api/experiments', desc: 'Create experiment with live validation' },
            { method: 'GET', path: '/api/models', desc: 'Retrieve registered 3D spatial models' },
            { method: 'GET', path: '/api/categories', desc: 'Fetch laboratory curriculum categories' },
            { method: 'POST', path: '/api/simulate', desc: 'Execute 3-valued fixpoint netlist solve' },
            { method: 'POST', path: '/api/validate-expression', desc: 'Parse Boolean algebra into SOP/POS truth tables' }
          ].map(ep => (
            <div key={ep.path + ep.method} className="p-3 bg-[#090b0f] border border-[#1e2332] rounded-lg space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  ep.method === 'GET' 
                    ? 'bg-[#15202e] text-blue-400 border border-blue-500/30' 
                    : 'bg-[#14231b] text-emerald-400 border border-emerald-500/30'
                }`}>
                  {ep.method}
                </span>
                <a href={ep.path} target="_blank" rel="noreferrer" className="text-white hover:text-emerald-400 font-bold flex items-center gap-1 transition-colors">
                  <span>{ep.path}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#5e667d]" />
                </a>
              </div>
              <p className="text-[10px] text-[#78829b] font-sans">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
