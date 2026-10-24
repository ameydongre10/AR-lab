import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { StatsResponse } from '../types/index.ts';
import { Layers, Box, CheckCircle2, Award, History, ArrowRight, Plus, ExternalLink, Activity, Sparkles } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">Loading laboratory statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Laboratory Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time curriculum statistics, student verification metrics, and 3D asset telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create Experiment
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Experiments</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats?.totalExperiments || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active curriculum activities</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">3D AR Models</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats?.totalModels || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">GLB spatial assets hosted</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lab Sessions</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{stats?.totalSessions || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">{stats?.verifiedSessions || 0} verified 100% runs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Pass Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{stats?.averagePassRate || 100}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Truth table compliance rate</div>
        </div>
      </div>

      {/* Grid: Recent Sessions Feed & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Lab Sessions */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Student Lab Sessions</h3>
            </div>
            <button
              onClick={() => onNavigate('sessions')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats?.recentSessions && stats.recentSessions.length > 0 ? (
              stats.recentSessions.map(session => (
                <div key={session.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">{session.studentName}</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {session.experimentTitle}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {session.passRate}% Pass
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {session.isVerified ? (
                      <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No lab sessions recorded yet. Launch an experiment to start verification.
              </div>
            )}
          </div>
        </div>

        {/* Quick Launch & Quick Links */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Browse Experiments</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('models')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 text-blue-400" />
                  <span>Manage 3D Assets</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                  <span>REST API & Health Check</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
