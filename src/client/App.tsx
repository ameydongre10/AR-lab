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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-300">
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
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
