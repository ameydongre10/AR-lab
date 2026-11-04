import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { CatalogPage } from './pages/CatalogPage.tsx';
import { ExperimentDetailPage } from './pages/ExperimentDetailPage.tsx';
import { CreateExperimentPage } from './pages/CreateExperimentPage.tsx';
import { EditExperimentPage } from './pages/EditExperimentPage.tsx';
import { AssetManagerPage } from './pages/AssetManagerPage.tsx';
import { SessionsHistoryPage } from './pages/SessionsHistoryPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';
import { api } from './services/api.ts';
import { Experiment } from './types/index.ts';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [paramId, setParamId] = useState<string | null>(null);
  const [featuredExperiments, setFeaturedExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    api.getExperiments({ limit: 6 })
      .then(res => setFeaturedExperiments(res.items))
      .catch(err => console.error('Failed to prefetch featured experiments:', err));
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setParamId(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#edf0f7] flex flex-col justify-between selection:bg-emerald-500/25 selection:text-emerald-300 relative bg-grid-industrial">
      {/* Top Instrumentation Telemetry Ticker Strip */}
      <div className="w-full bg-[#0d0f15] border-b border-[#1f2230] px-4 py-1.5 flex items-center justify-between text-[11px] font-mono tracking-tight text-[#7e859e]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-phosphor-sm"></span>
            <span className="text-[#a2abbf] font-semibold">LAB-MAIN // CH-01</span>
          </div>
          <span className="hidden sm:inline-block text-[#363b50]">|</span>
          <span className="hidden sm:inline-block">BUS: <span className="text-amber-400 font-bold font-mono">+5.00V DC</span></span>
          <span className="hidden md:inline-block text-[#363b50]">|</span>
          <span className="hidden md:inline-block">LOGIC: <span className="text-emerald-400 font-mono font-medium">3-VAL FIXPOINT (0, 1, X)</span></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-block text-[#646b82]">TI 7400 TTL COMPLIANT</span>
          <span className="hidden lg:inline-block text-[#363b50]">|</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#161922] border border-[#2a2f42] text-[10px] text-[#a2abbf]">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            WEBXR / QUICKLOOK READY
          </span>
        </div>
      </div>

      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 w-full flex-1 relative z-10">
        {currentView === 'home' && (
          <HomePage onNavigate={handleNavigate} featuredExperiments={featuredExperiments} />
        )}
        {currentView === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}
        {currentView === 'catalog' && (
          <CatalogPage onNavigate={handleNavigate} />
        )}
        {currentView === 'experiment' && paramId && (
          <ExperimentDetailPage experimentId={paramId} onNavigate={handleNavigate} />
        )}
        {currentView === 'create' && (
          <CreateExperimentPage onNavigate={handleNavigate} />
        )}
        {currentView === 'edit' && paramId && (
          <EditExperimentPage experimentId={paramId} onNavigate={handleNavigate} />
        )}
        {currentView === 'models' && (
          <AssetManagerPage onNavigate={handleNavigate} />
        )}
        {currentView === 'sessions' && (
          <SessionsHistoryPage onNavigate={handleNavigate} />
        )}
        {currentView === 'settings' && (
          <SettingsPage />
        )}
        {currentView === '404' && (
          <NotFoundPage onNavigate={handleNavigate} />
        )}
      </main>

      <Footer />
    </div>
  );
};
