import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { LabSession } from '../types/index.ts';
import { History, CheckCircle2, XCircle, Trash2, ArrowRight, ChevronDown, ChevronUp, Terminal, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-8 pb-16 font-mono">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#202535]">
        <div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
            [ AUDIT ARCHIVE // VERIFICATION TELEMETRY ]
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Laboratory Verification History
          </h1>
          <p className="text-xs text-[#828ca1] mt-1 font-sans">
            Student circuit runs, evaluated truth tables, and compliance records saved from the Virtual Breadboard.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-[#202535] border-t-emerald-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-[#717a94]">RETRIEVING VERIFICATION LEDGERS...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-12 text-center space-y-3">
          <History className="w-8 h-8 text-[#545e75] mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Verification Sessions Recorded</h3>
          <p className="text-xs text-[#7d879e] max-w-sm mx-auto font-sans">
            Launch any lab experiment from the catalog, toggle the truth table rows on the workbench, and commit a verified run.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="btn-tactile text-xs text-emerald-400 hover:underline pt-2 inline-block cursor-pointer font-bold"
          >
            Open Experiment Catalog &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const isExpanded = expandedId === session.id;

            return (
              <div
                key={session.id}
                className="bg-[#0f1118] border border-[#232737] hover:border-[#384059] rounded-xl p-5 shadow-xl space-y-4 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-white font-sans">{session.studentName}</h3>
                      {session.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-[#14231b] text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED 100% PASS
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#251b14] text-amber-400 border border-amber-500/30">
                          PARTIAL // {session.passRate}%
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-emerald-400 font-bold">
                      {session.experimentTitle}
                    </div>

                    <div className="text-[10px] text-[#5e667d]">
                      STAMP: {new Date(session.createdAt).toLocaleString()} • STATION: AR-NODE-01
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : session.id)}
                      className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 bg-[#141722] hover:bg-[#1b2030] text-[#a0a9c2] hover:text-white text-xs font-bold rounded-lg border border-[#252a3b] transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'COLLAPSE' : 'INSPECT TRUTH TABLE'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => onNavigate('experiment', session.experimentId)}
                      className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      <span>RELOAD BENCH</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDelete(session.id)}
                      title="Purge session record"
                      className="btn-tactile p-1.5 text-[#6b758d] hover:text-rose-400 bg-[#141722] border border-[#222737] rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expanded Truth Table Rows */}
                {isExpanded && (
                  <div className="pt-3 border-t border-[#1c202d] space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#737c94]">
                      AUDITED TRUTH TABLE VECTOR DATA
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-[#1e2332]">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-[#090b0f] text-[#717a94] border-b border-[#1e2332]">
                          <tr>
                            <th className="px-3.5 py-2 text-center">BINARY VECTOR</th>
                            <th className="px-3.5 py-2 text-center text-white">EXPECTED</th>
                            <th className="px-3.5 py-2 text-center text-emerald-400">MEASURED</th>
                            <th className="px-3.5 py-2 text-center">OUTCOME</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#171a26]">
                          {session.truthTableResults?.map(row => (
                            <tr key={row.binary} className="hover:bg-[#12141c]">
                              <td className="px-3.5 py-2 text-center text-white font-bold">{row.binary}</td>
                              <td className="px-3.5 py-2 text-center text-[#8e98b0]">{row.expected ? '1' : '0'}</td>
                              <td className="px-3.5 py-2 text-center text-[#8e98b0]">{row.actual ? '1' : '0'}</td>
                              <td className="px-3.5 py-2 text-center">
                                {row.passed ? (
                                  <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]">
                                    <CheckCircle2 className="w-3 h-3" />
                                    PASS
                                  </span>
                                ) : (
                                  <span className="text-rose-400 font-bold inline-flex items-center gap-1 text-[11px]">
                                    <XCircle className="w-3 h-3" />
                                    FAULT
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
