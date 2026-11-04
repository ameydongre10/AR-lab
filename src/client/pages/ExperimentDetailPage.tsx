import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Experiment } from '../types/index.ts';
import { Model3DViewer } from '../components/Model3DViewer.tsx';
import { ArLaunchModal } from '../components/ArLaunchModal.tsx';
import { VirtualBreadboardStudio } from '../components/VirtualBreadboardStudio.tsx';
import { ArrowLeft, Edit3, BookOpen, Cpu, Compass, Terminal, ShieldCheck } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono">
        <div className="w-8 h-8 border-2 border-[#202535] border-t-emerald-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-[#717a94]">CALIBRATING BENCH FOR EXPERIMENT...</p>
      </div>
    );
  }

  const modelUrl = (experiment as any).model?.fileUrl || '/models/ar-lab-station.glb';

  return (
    <div className="space-y-8 pb-16 font-mono">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#202535]">
        <button
          onClick={() => onNavigate('catalog')}
          className="btn-tactile flex items-center gap-2 text-xs text-[#8c96b0] hover:text-white bg-[#10121a] border border-[#222737] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CATALOG DIRECTORY</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('edit', experiment.id)}
            className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 bg-[#141722] hover:bg-[#1a1e2c] text-[#a0a9c2] hover:text-white text-xs font-bold rounded-lg border border-[#262c3e] transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT SPECIFICATION</span>
          </button>

          <button
            onClick={() => setIsArModalOpen(true)}
            className="btn-tactile flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>LAUNCH SPATIAL AR</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Sheet: Module Data & 3D Asset Reticle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Specification Column (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="font-bold px-2 py-0.5 rounded bg-[#161a25] text-emerald-400 border border-emerald-500/30">
                {experiment.canonicalForm} CANONICAL FORM
              </span>
              <span className="px-2 py-0.5 rounded bg-[#13151f] text-[#78829b] border border-[#222636] uppercase font-bold">
                TIER: {experiment.difficulty}
              </span>
              {(experiment as any).category && (
                <span className="px-2 py-0.5 rounded bg-[#13151f] text-[#9ba4be] border border-[#222636]">
                  {(experiment as any).category.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              {experiment.title}
            </h1>

            {/* Target Formula Panel */}
            <div className="p-3 bg-[#090b0f] border border-[#222737] rounded-lg flex items-center justify-between text-xs">
              <span className="text-[#717a94] uppercase tracking-wider font-bold">TARGET BOOLEAN EQUATION:</span>
              <span className="text-emerald-400 font-bold text-sm tracking-wide">
                F = {experiment.targetExpression}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#8c97b0] leading-relaxed font-sans">
              {experiment.description}
            </p>
          </div>

          {/* Required Hardware Chips */}
          <div className="pt-3 border-t border-[#1c202d] space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#717a94] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>REQUIRED TTL 7400 HARDWARE PACKAGES</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {experiment.requiredIcs.map(ic => (
                <div key={ic} className="p-2.5 bg-[#090b0f] border border-[#1e2332] rounded-lg space-y-0.5">
                  <div className="text-xs font-bold text-emerald-400">SN{ic}N</div>
                  <div className="text-[10px] text-[#717a94]">
                    {ic === '7404' ? 'Hex Inverter (NOT)' : ic === '7408' ? 'Quad 2-In AND' : 'Quad 2-In OR'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right CAD Viewport (5 cols) */}
        <div className="lg:col-span-5 h-[360px] sm:h-[400px]">
          <Model3DViewer
            modelUrl={modelUrl}
            altText={experiment.title}
            onArLaunch={() => setIsArModalOpen(true)}
          />
        </div>
      </div>

      {/* 3. Laboratory Wiring Procedure */}
      <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex items-center gap-2 pb-2.5 border-b border-[#1f2231]">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            LABORATORY STANDARD OPERATING PROCEDURE & WIRING PROTOCOL
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {experiment.instructions.map((step, idx) => (
            <div key={idx} className="bg-[#090b0f] border border-[#1e2332] rounded-lg p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#161a25] border border-[#293043] text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  {step.step || idx + 1}
                </span>
                <h4 className="text-xs font-bold text-white font-sans">{step.title}</h4>
              </div>
              <p className="text-xs text-[#808a9f] leading-relaxed pl-7 font-sans">
                {step.details}
              </p>
              {step.wiringTips && (
                <div className="pl-7 pt-1 text-[10px] text-amber-400">
                  ⚡ ADVISORY: {step.wiringTips}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Virtual Breadboard Studio */}
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
