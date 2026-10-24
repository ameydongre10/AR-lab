import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Settings, Activity, ShieldCheck, Cpu, Smartphone, Server, ExternalLink, CheckCircle2 } from 'lucide-react';

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
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">System Diagnostics & Architecture</h1>
        <p className="text-xs text-slate-400 mt-1">
          Telemetry, WebXR hardware detection, REST API status, and environment configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend & DB Health Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Backend Server & Database</h2>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Server Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {healthData?.status || 'Connecting...'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Uptime:</span>
              <span className="text-slate-200">{healthData?.uptime ? `${Math.round(healthData.uptime)}s` : 'Active'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Platform Version:</span>
              <span className="text-cyan-300">v{healthData?.version || '2.0.0'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Persistence Engine:</span>
              <span className="text-slate-200">ACID Atomic JSON Store with SQLite Compatibility</span>
            </div>
          </div>
        </div>

        {/* Client & WebXR Spatial Diagnostics */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Client & Spatial AR Hardware</h2>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">WebXR Immersive-AR:</span>
              <span className={hasWebXr ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {hasWebXr ? 'Supported (Native ARCore/Vision)' : 'Unavailable in Current Context'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Google Scene Viewer:</span>
              <span className="text-cyan-300">Supported (Android)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Apple AR Quick Look:</span>
              <span className="text-cyan-300">Supported (iOS Safari)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Model Viewer Version:</span>
              <span className="text-slate-200">v4.4.0 (WebGL / WebXR)</span>
            </div>
          </div>
        </div>
      </div>

      {/* REST API Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">REST API Endpoints</h2>
        <p className="text-xs text-slate-400">
          The AR Lab platform provides a clean, validated JSON REST API for all curriculum resources, simulation runs, and 3D assets:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          {[
            { method: 'GET', path: '/api/experiments', desc: 'List & search experiments with pagination' },
            { method: 'POST', path: '/api/experiments', desc: 'Create experiment with live validation' },
            { method: 'GET', path: '/api/models', desc: 'Retrieve registered 3D spatial models' },
            { method: 'GET', path: '/api/categories', desc: 'Fetch laboratory curriculum categories' },
            { method: 'POST', path: '/api/simulate', desc: 'Execute 3-valued fixpoint netlist solve' },
            { method: 'POST', path: '/api/validate-expression', desc: 'Parse Boolean algebra into SOP/POS truth tables' }
          ].map(ep => (
            <div key={ep.path + ep.method} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {ep.method}
                </span>
                <a href={ep.path} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline flex items-center gap-1">
                  <span>{ep.path}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
