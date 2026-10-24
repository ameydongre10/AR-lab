import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { LabSession } from '../types/index.ts';
import { History, CheckCircle2, XCircle, Trash2, ArrowRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface SessionsHistoryPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SessionsHistoryPage: React.FC<SessionsHistoryPageProps> = ({ onNavigate }) => {
  const [sessions, setSessions] = useState<(LabSession & { experimentTitle?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadSessions = () => {
    setIsLoading(true);
    api.getSessions()
      .then(res => setSessions(res))
      .catch(err => console.error('Failed to load lab sessions:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSession(id);
      loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Lab Sessions & Verification History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Student circuit runs, evaluated truth tables, and compliance records saved from the Virtual Breadboard.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-400">Loading lab records...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Sessions Recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Launch any lab experiment from the catalog, test the truth table rows, and click "Record Verified Lab Run" to log a session.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-cyan-400 hover:underline pt-2 inline-block cursor-pointer"
          >
            Go to Experiments Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const isExpanded = expandedId === session.id;

            return (
              <div
                key={session.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{session.studentName}</h3>
                      {session.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED 100%
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          PARTIAL ({session.passRate}%)
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-cyan-400 font-mono">
                      {session.experimentTitle}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Logged on {new Date(session.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Inspect Rows'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onNavigate('experiment', session.experimentId)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold rounded-xl border border-cyan-500/30 transition-colors cursor-pointer"
                    >
                      <span>Replay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(session.id)}
                      title="Delete Session"
                      className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Truth Table Details */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-800/80 space-y-3 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Evaluated Truth Table Rows
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="px-3.5 py-2 text-center">Binary</th>
                            <th className="px-3.5 py-2 text-center">Expected</th>
                            <th className="px-3.5 py-2 text-center">Simulated</th>
                            <th className="px-3.5 py-2 text-center">Outcome</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {session.truthTableResults?.map(row => (
                            <tr key={row.binary} className="hover:bg-slate-950/40">
                              <td className="px-3.5 py-2 text-center text-cyan-300 font-bold">{row.binary}</td>
                              <td className="px-3.5 py-2 text-center text-slate-300">{row.expected ? '1' : '0'}</td>
                              <td className="px-3.5 py-2 text-center text-slate-300">{row.actual ? '1' : '0'}</td>
                              <td className="px-3.5 py-2 text-center">
                                {row.passed ? (
                                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    PASS
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-semibold inline-flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" />
                                    MISMATCH
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
