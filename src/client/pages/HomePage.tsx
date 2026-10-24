import React, { useState } from 'react';
import { Model3DViewer } from '../components/Model3DViewer.tsx';
import { ArLaunchModal } from '../components/ArLaunchModal.tsx';
import { Sparkles, ArrowRight, Layers, Cpu, ShieldCheck, CheckCircle, Zap, BookOpen } from 'lucide-react';
import { Experiment } from '../types/index.ts';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  featuredExperiments: Experiment[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, featuredExperiments }) => {
  const [isArModalOpen, setIsArModalOpen] = useState(false);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Spatial Circuit Education</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Construct, Simulate & Verify Digital Logic in{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
                Augmented Reality
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Step onto the virtual electronics workbench. Seat real 7400-series TTL chips onto solderless breadboards, wire gates, and verify Boolean functions in SOP and POS forms with a deterministic 3-valued fixpoint logic engine.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span>Explore Lab Experiments</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsArModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Launch AR Workbench</span>
              </button>
            </div>

            {/* Metric Badges */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-black text-white font-mono">100%</div>
                <div className="text-xs text-slate-400 font-medium">3-Valued Logic Engine</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">WebXR</div>
                <div className="text-xs text-slate-400 font-medium">& iOS Quick Look</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono">7400</div>
                <div className="text-xs text-slate-400 font-medium">TTL Series Chips</div>
              </div>
            </div>
          </div>

          {/* Right Hero 3D Interactive Model Viewer */}
          <div className="lg:col-span-5 h-[420px] sm:h-[480px]">
            <Model3DViewer
              modelUrl="/models/ar-lab-station.glb"
              posterUrl="/posters/ar-station.png"
              altText="AR Lab Workbench 3D Preview"
              onArLaunch={() => setIsArModalOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Engineering Fidelity</h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Built for Real Academic Laboratory Standards</h3>
          <p className="text-sm text-slate-400">
            Every breadboard row, DIP pin collider, and logic gate respects Texas Instruments datasheet specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">SOP & POS Canonical Forms</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify function equivalence between Sum-of-Products (minterms conjoined with AND, then ORed) and Product-of-Sums (maxterms ORed, then ANDed).
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">3-Valued Fixpoint Solver</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Models Low (0), High (1), and Undefined (X). Prevents false-positive validations when power supplies are unhooked or inputs are left floating.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Authentic TTL 7400 Pinouts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              True 14-pin DIP layouts for SN7404 (Hex Inverter), SN7408 (Quad 2-Input AND), and SN7432 (Quad 2-Input OR) with Pin 14 VCC and Pin 7 GND.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Experiments Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">Laboratory Curriculum</h2>
            <h3 className="text-2xl font-bold text-white tracking-tight">Featured Experiments</h3>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredExperiments.slice(0, 3).map(exp => (
            <div
              key={exp.id}
              onClick={() => onNavigate('experiment', exp.id)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {exp.canonicalForm} Form
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {exp.difficulty}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-400">
                  {exp.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {exp.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-cyan-300 text-[11px]">
                  <span>F = {exp.targetExpression}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 font-semibold text-[11px]">
                  <span>Launch Lab</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AR Modal */}
      <ArLaunchModal
        isOpen={isArModalOpen}
        onClose={() => setIsArModalOpen(false)}
        modelUrl="/models/ar-lab-station.glb"
        modelTitle="AR Digital Electronics Laboratory Workbench"
      />
    </div>
  );
};
