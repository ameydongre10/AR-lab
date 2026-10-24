import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Experiment } from '../types/index.ts';
import { Model3DViewer } from '../components/Model3DViewer.tsx';
import { ArLaunchModal } from '../components/ArLaunchModal.tsx';
import { VirtualBreadboardStudio } from '../components/VirtualBreadboardStudio.tsx';
import { ArrowLeft, Sparkles, Edit3, Layers, BookOpen, CheckCircle2, Cpu, HelpCircle } from 'lucide-react';

interface ExperimentDetailPageProps {
  experimentId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ExperimentDetailPage: React.FC<ExperimentDetailPageProps> = ({
  experimentId,
  onNavigate
}) => {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArModalOpen, setIsArModalOpen] = useState(false);

  const loadExperiment = () => {
    setIsLoading(true);
    api.getExperiment(experimentId)
      .then(res => setExperiment(res))
      .catch(err => console.error('Failed to load experiment:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  if (isLoading || !experiment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">Loading laboratory activity...</p>
      </div>
    );
  }

  const modelUrl = (experiment as any).model?.fileUrl || '/models/ar-lab-station.glb';

  return (
    <div className="space-y-8 pb-16">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('edit', experiment.id)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Experiment</span>
          </button>

          <button
            onClick={() => setIsArModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Spatial AR</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card: Text & 3D Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {experiment.canonicalForm} Canonical Form
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {experiment.difficulty} Level
              </span>
              {(experiment as any).category && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {(experiment as any).category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {experiment.title}
            </h1>

            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Target Boolean Function:</span>
              <span className="text-cyan-300 font-bold text-sm">F = {experiment.targetExpression}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {experiment.description}
            </p>
          </div>

          {/* Required Hardware Breakdown */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Required Laboratory Components
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {experiment.requiredIcs.map(ic => (
                <div key={ic} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                  <div className="text-xs font-mono font-bold text-cyan-400">SN{ic}N</div>
                  <div className="text-[10px] text-slate-400">
                    {ic === '7404' ? 'Hex Inverter (6 NOT)' : ic === '7408' ? 'Quad 2-Input AND' : 'Quad 2-Input OR'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 3D AR Preview Viewer */}
        <div className="lg:col-span-5 h-[360px] sm:h-[420px]">
          <Model3DViewer
            modelUrl={modelUrl}
            altText={experiment.title}
            onArLaunch={() => setIsArModalOpen(true)}
          />
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-tight uppercase tracking-wider">
            Laboratory Procedure & Wiring Instructions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiment.instructions.map((step, idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                  {step.step || idx + 1}
                </span>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-8">
                {step.details}
              </p>
              {step.wiringTips && (
                <div className="pl-8 pt-1 text-[11px] text-amber-300/90 font-mono">
                  💡 Tip: {step.wiringTips}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Virtual Breadboard Studio */}
      <VirtualBreadboardStudio experiment={experiment} />

      {/* AR Launch Modal */}
      <ArLaunchModal
        isOpen={isArModalOpen}
        onClose={() => setIsArModalOpen(false)}
        modelUrl={modelUrl}
        modelTitle={experiment.title}
      />
    </div>
  );
};
