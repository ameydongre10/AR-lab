import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (view: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4 font-mono">
      <div className="w-12 h-12 rounded-lg bg-[#1a1415] border border-rose-500/40 flex items-center justify-center text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h1 className="text-xl font-bold text-white uppercase tracking-wider">
        404 // RESOURCE ADDRESS UNRESOLVED
      </h1>
      <p className="text-xs text-[#828c9f] max-w-sm font-sans">
        The requested laboratory activity or coordinate does not exist in the active curriculum register.
      </p>
      <button
        onClick={() => onNavigate('catalog')}
        className="btn-tactile flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>RETURN TO CATALOG</span>
      </button>
    </div>
  );
};
