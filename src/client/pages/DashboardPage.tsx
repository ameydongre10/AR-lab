import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { StatsResponse } from '../types/index.ts';
import { Layers, Box, CheckCircle2, Award, History, ArrowRight, Plus, ExternalLink, Activity, Terminal, ShieldCheck } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(res => setStats(res))
      .catch(err => console.error('Failed to load dashboard stats:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono">
        <div className="w-8 h-8 border-2 border-[#202535] border-t-emerald-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-[#717a94]">ACQUIRING TELEMETRY STREAMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 font-mono">
      
      {/* 1. Telemetry Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#202535]">
        <div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
            [ TELEMETRY CONSOLE // REAL-TIME LOGIC AUDIT ]
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Laboratory Telemetry Bench
          </h1>
          <p className="text-xs text-[#828ca1] mt-1 font-sans">
            Real-time curriculum statistics, student verification metrics, and 3D asset telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create')}
            className="btn-tactile flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>AUTHOR EXPERIMENT</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Precision Gauge Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3 text-[10px] text-[#717a94] uppercase tracking-wider font-bold">
            <span>CURRICULUM MODULES</span>
            <div className="w-7 h-7 rounded bg-[#161a25] border border-[#262c3e] flex items-center justify-center text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">{stats?.totalExperiments || 0}</div>
          <div className="text-[11px] text-[#6d768e] mt-1">Active lab assignments</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3 text-[10px] text-[#717a94] uppercase tracking-wider font-bold">
            <span>3D SPATIAL ASSETS</span>
            <div className="w-7 h-7 rounded bg-[#161a25] border border-[#262c3e] flex items-center justify-center text-blue-400">
              <Box className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">{stats?.totalModels || 0}</div>
          <div className="text-[11px] text-[#6d768e] mt-1">Calibrated GLB geometries</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3 text-[10px] text-[#717a94] uppercase tracking-wider font-bold">
            <span>VERIFICATION RUNS</span>
            <div className="w-7 h-7 rounded bg-[#161a25] border border-[#262c3e] flex items-center justify-center text-amber-400">
              <History className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">{stats?.totalSessions || 0}</div>
          <div className="text-[11px] text-[#6d768e] mt-1">
            <span className="text-emerald-400 font-bold">{stats?.verifiedSessions || 0}</span> confirmed passes
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between mb-3 text-[10px] text-[#717a94] uppercase tracking-wider font-bold">
            <span>COMPLIANCE RATE</span>
            <div className="w-7 h-7 rounded bg-[#161a25] border border-[#262c3e] flex items-center justify-center text-emerald-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 tabular-nums glow-phosphor-sm">
            {stats?.averagePassRate || 100}%
          </div>
          <div className="text-[11px] text-[#6d768e] mt-1">Truth table verification mean</div>
        </div>
      </div>

      {/* 3. Telemetry Stream & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Student Lab Verification Ledger (8 cols) */}
        <div className="lg:col-span-8 bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2231]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                RECENT STUDENT VERIFICATION LOGS
              </h3>
            </div>
            <button
              onClick={() => onNavigate('sessions')}
              className="btn-tactile text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>AUDIT ARCHIVE</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-[#171a26]">
            {stats?.recentSessions && stats.recentSessions.length > 0 ? (
              stats.recentSessions.map(session => (
                <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-white font-sans">{session.studentName}</div>
                    <div className="text-xs text-[#7d87a1]">
                      {session.experimentTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 tabular-nums">
                        {session.passRate}% PASS
                      </div>
                      <div className="text-[10px] text-[#555d73]">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {session.isVerified ? (
                      <span className="p-1 rounded bg-[#14231b] text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#171a26] text-[#717a94] border border-[#242939]">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#636c84]">
                No lab sessions recorded yet. Launch an experiment from the catalog to record verification.
              </div>
            )}
          </div>
        </div>

        {/* Right: Subsystem Route Switches (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#1f2231]">
              SUB-ROUTINE DISPATCH
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('catalog')}
                className="btn-tactile w-full flex items-center justify-between p-3 rounded-lg bg-[#0a0c12] hover:bg-[#141722] border border-[#1e2332] hover:border-[#2f374e] text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Curriculum Catalog</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#5e667d]" />
              </button>

              <button
                onClick={() => onNavigate('models')}
                className="btn-tactile w-full flex items-center justify-between p-3 rounded-lg bg-[#0a0c12] hover:bg-[#141722] border border-[#1e2332] hover:border-[#2f374e] text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                  <span>3D CAD Asset Vault</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#5e667d]" />
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="btn-tactile w-full flex items-center justify-between p-3 rounded-lg bg-[#0a0c12] hover:bg-[#141722] border border-[#1e2332] hover:border-[#2f374e] text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Diagnostics & API Stream</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#5e667d]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
