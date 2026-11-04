import React, { useState } from 'react';
import { Model3DViewer } from '../components/Model3DViewer.tsx';
import { ArLaunchModal } from '../components/ArLaunchModal.tsx';
import { ArrowRight, Layers, Cpu, ShieldCheck, CheckCircle2, Activity, Terminal, Compass, Box, Zap, ChevronRight } from 'lucide-react';
import { Experiment } from '../types/index.ts';

interface HomePageProps {
  onNavigate: (view: string, param?: string) => void;
  featuredExperiments: Experiment[];
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, featuredExperiments }) => {
  const [isArModalOpen, setIsArModalOpen] = useState(false);
  const [activeChipTab, setActiveChipTab] = useState<'7404' | '7408' | '7432'>('7408');

  const chipDetails = {
    '7404': {
      part: 'SN7404N',
      name: 'Hex Inverter (NOT Gates)',
      propagationDelay: '9 ns',
      gateCount: '6 Inverters',
      vccPin: 'Pin 14 (+5V DC)',
      gndPin: 'Pin 7 (GND)',
      description: 'Contains six independent inverters performing the Boolean function Y = A\'. Inputs accept standard TTL logic levels.',
      pinout: [
        { pin: 1, label: '1A (In 1)' },
        { pin: 2, label: '1Y (Out 1)' },
        { pin: 3, label: '2A (In 2)' },
        { pin: 4, label: '2Y (Out 2)' },
        { pin: 5, label: '3A (In 3)' },
        { pin: 6, label: '3Y (Out 3)' },
        { pin: 7, label: 'GND (0V)' },
        { pin: 8, label: '4Y (Out 4)' },
        { pin: 9, label: '4A (In 4)' },
        { pin: 10, label: '5Y (Out 5)' },
        { pin: 11, label: '5A (In 5)' },
        { pin: 12, label: '6Y (Out 6)' },
        { pin: 13, label: '6A (In 6)' },
        { pin: 14, label: 'VCC (+5V)' }
      ]
    },
    '7408': {
      part: 'SN7408N',
      name: 'Quadruple 2-Input Positive-AND Gates',
      propagationDelay: '15 ns',
      gateCount: '4 AND Gates',
      vccPin: 'Pin 14 (+5V DC)',
      gndPin: 'Pin 7 (GND)',
      description: 'Contains four independent 2-input positive-AND gates performing Y = A • B. Essential for Sum-of-Products (SOP) minterm conjoining.',
      pinout: [
        { pin: 1, label: '1A (In 1)' },
        { pin: 2, label: '1B (In 2)' },
        { pin: 3, label: '1Y (Out 1)' },
        { pin: 4, label: '2A (In 1)' },
        { pin: 5, label: '2B (In 2)' },
        { pin: 6, label: '2Y (Out 2)' },
        { pin: 7, label: 'GND (0V)' },
        { pin: 8, label: '3Y (Out 3)' },
        { pin: 9, label: '3A (In 1)' },
        { pin: 10, label: '3B (In 2)' },
        { pin: 11, label: '4Y (Out 4)' },
        { pin: 12, label: '4A (In 1)' },
        { pin: 13, label: '4B (In 2)' },
        { pin: 14, label: 'VCC (+5V)' }
      ]
    },
    '7432': {
      part: 'SN7432N',
      name: 'Quadruple 2-Input Positive-OR Gates',
      propagationDelay: '14 ns',
      gateCount: '4 OR Gates',
      vccPin: 'Pin 14 (+5V DC)',
      gndPin: 'Pin 7 (GND)',
      description: 'Contains four independent 2-input positive-OR gates performing Y = A + B. Standard building block for Product-of-Sums (POS) disjunction.',
      pinout: [
        { pin: 1, label: '1A (In 1)' },
        { pin: 2, label: '1B (In 2)' },
        { pin: 3, label: '1Y (Out 1)' },
        { pin: 4, label: '2A (In 1)' },
        { pin: 5, label: '2B (In 2)' },
        { pin: 6, label: '2Y (Out 2)' },
        { pin: 7, label: 'GND (0V)' },
        { pin: 8, label: '3Y (Out 3)' },
        { pin: 9, label: '3A (In 1)' },
        { pin: 10, label: '3B (In 2)' },
        { pin: 11, label: '4Y (Out 4)' },
        { pin: 12, label: '4A (In 1)' },
        { pin: 13, label: '4B (In 2)' },
        { pin: 14, label: 'VCC (+5V)' }
      ]
    }
  };

  const currentChip = chipDetails[activeChipTab];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Swiss Industrial Asymmetrical Hero */}
      <section className="relative pt-2 sm:pt-6">
        
        {/* Engineering Chassis Header Tag */}
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-[#202535] text-[10px] font-mono text-[#747e99]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-white font-semibold">STATION ID: AR-7400-BENCH</span>
            <span>//</span>
            <span>ACCREDITATION: IEEE 91-1984</span>
          </div>
          <div className="hidden sm:block">
            <span>GRID COORD: [A1 - J30]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Bold Industrial Typography & Core Action Cluster (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#131620] border border-[#262c3e] text-[11px] font-mono text-emerald-400">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>DETERMINISTIC 3-VALUED LOGIC ENGINE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] font-sans">
              Precision Digital Electronics in Physical & Spatial Reality.
            </h1>

            <p className="text-base sm:text-lg text-[#949eb5] max-w-xl font-normal leading-relaxed">
              Design, wire, and verify Texas Instruments 7400-series TTL integrated circuits on virtual solderless breadboards. Evaluate Sum-of-Products (SOP) and Product-of-Sums (POS) logic networks with real-world propagation delay and floating-pin detection.
            </p>

            {/* Tactile Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="btn-tactile flex items-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-mono font-bold text-xs tracking-wider uppercase rounded-lg shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <span>EXPLORE LAB CURRICULUM</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsArModalOpen(true)}
                className="btn-tactile flex items-center gap-2.5 px-5 py-3.5 bg-[#141722] hover:bg-[#1b2030] text-emerald-300 font-mono font-semibold text-xs rounded-lg border border-[#2b3348] hover:border-emerald-500/50 transition-all cursor-pointer shadow-md"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>LAUNCH SPATIAL AR</span>
              </button>
            </div>

            {/* Industrial Calibration Metric Strips */}
            <div className="pt-6 border-t border-[#1f2434] grid grid-cols-3 gap-4 font-mono">
              <div className="p-3 bg-[#11131a] border border-[#1f2332] rounded-lg">
                <div className="text-2xl font-black text-white tabular-nums">100%</div>
                <div className="text-[10px] text-[#717a94] uppercase mt-0.5">3-Valued Solver (0, 1, X)</div>
              </div>

              <div className="p-3 bg-[#11131a] border border-[#1f2332] rounded-lg">
                <div className="text-2xl font-black text-emerald-400 tabular-nums">&lt;15ns</div>
                <div className="text-[10px] text-[#717a94] uppercase mt-0.5">Propagation Delay Model</div>
              </div>

              <div className="p-3 bg-[#11131a] border border-[#1f2332] rounded-lg">
                <div className="text-2xl font-black text-white tabular-nums">WebXR</div>
                <div className="text-[10px] text-[#717a94] uppercase mt-0.5">iOS ARKit & Android ARCore</div>
              </div>
            </div>
          </div>

          {/* Right: Precision CAD 3D Workstation (5 cols) */}
          <div className="lg:col-span-5 h-[420px] sm:h-[480px]">
            <Model3DViewer
              modelUrl="/models/ar-lab-station.glb"
              posterUrl="/posters/ar-station.png"
              altText="Precision AR Lab Workbench CAD Asset"
              onArLaunch={() => setIsArModalOpen(true)}
            />
          </div>
        </div>
      </section>

      {/* 2. Laboratory Electrical Specification Banner */}
      <section className="bg-[#10121a] border border-[#222738] rounded-xl p-5 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold tracking-wider uppercase">[ TTL OPERATING PARAMETERS ]</span>
            <span className="text-[#5b637a]">|</span>
            <span className="text-[#8892ad]">Supply: <span className="text-amber-400 font-bold">+5.00V ± 5%</span></span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#8892ad]">
            <span>V_IH: <span className="text-white font-bold">≥ 2.0V</span></span>
            <span>V_IL: <span className="text-white font-bold">≤ 0.8V</span></span>
            <span>V_OH: <span className="text-white font-bold">≥ 2.4V</span></span>
            <span>V_OL: <span className="text-white font-bold">≤ 0.4V</span></span>
            <span>FANOUT: <span className="text-emerald-400 font-bold">10 TTL LOADS</span></span>
          </div>
        </div>
      </section>

      {/* 3. Interactive TTL 7400 Chip Explorer */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#202535]">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              [ SUBSYSTEM 02 // HARDWARE SPEC ]
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Integrated Circuit DIP-14 Architecture
            </h3>
          </div>

          {/* Segment Selector Tabs */}
          <div className="flex items-center bg-[#11131c] border border-[#222738] rounded-lg p-1 font-mono text-xs">
            {(['7404', '7408', '7432'] as const).map(chipId => (
              <button
                key={chipId}
                onClick={() => setActiveChipTab(chipId)}
                className={`btn-tactile px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeChipTab === chipId
                    ? 'bg-[#1e2332] text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-[#7e88a3] hover:text-white border border-transparent'
                }`}
              >
                SN{chipId}N
              </button>
            ))}
          </div>
        </div>

        {/* Selected Chip Spec & Pinout Sheet */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono">
          
          {/* Left: Chip Overview & Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="inline-block text-[10px] px-2 py-0.5 rounded bg-[#161a26] text-emerald-400 border border-emerald-500/30 mb-2">
                TEXAS INSTRUMENTS STANDARD
              </div>
              <h4 className="text-2xl font-black text-white">{currentChip.part}</h4>
              <p className="text-sm text-[#8c97b0] mt-1 font-sans">{currentChip.name}</p>
            </div>

            <p className="text-xs text-[#808b9f] leading-relaxed font-sans">
              {currentChip.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-[#0a0c12] border border-[#1e2331] rounded-lg">
                <span className="text-[10px] text-[#6d768f] uppercase">Propagation Delay</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">{currentChip.propagationDelay}</div>
              </div>
              <div className="p-3 bg-[#0a0c12] border border-[#1e2331] rounded-lg">
                <span className="text-[10px] text-[#6d768f] uppercase">Internal Gates</span>
                <div className="text-base font-bold text-white mt-0.5">{currentChip.gateCount}</div>
              </div>
              <div className="p-3 bg-[#0a0c12] border border-[#1e2331] rounded-lg">
                <span className="text-[10px] text-[#6d768f] uppercase">Power Supply</span>
                <div className="text-xs font-bold text-amber-400 mt-1">{currentChip.vccPin}</div>
              </div>
              <div className="p-3 bg-[#0a0c12] border border-[#1e2331] rounded-lg">
                <span className="text-[10px] text-[#6d768f] uppercase">Ground Reference</span>
                <div className="text-xs font-bold text-blue-400 mt-1">{currentChip.gndPin}</div>
              </div>
            </div>
          </div>

          {/* Right: Authentic 14-Pin DIP Pinout Diagram (7 cols) */}
          <div className="lg:col-span-7 bg-[#0a0c12] border border-[#1e2332] rounded-xl p-5 sm:p-6 flex flex-col justify-center">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1b1f2e] text-xs">
              <span className="text-white font-bold">14-LEAD PLASTIC DUAL-IN-LINE PACKAGE (N)</span>
              <span className="text-[#646e86]">TOP VIEW</span>
            </div>

            {/* Ceramic Chip Package Drawing */}
            <div className="relative mx-auto w-full max-w-md bg-[#13151f] border-2 border-[#2b3144] rounded-lg p-4 shadow-xl">
              {/* Notch at Top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-[#0a0c12] rounded-b border-b border-x border-[#3b435c]"></div>
              
              {/* Pin 1 dot */}
              <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-emerald-400 glow-phosphor-sm"></div>

              {/* Pin Grid: Left Pins (1-7) & Right Pins (14-8) */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 py-3 text-[11px]">
                {/* Left Side: Pins 1 to 7 */}
                <div className="space-y-2">
                  {currentChip.pinout.slice(0, 7).map(p => (
                    <div key={p.pin} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#1e2230] border border-[#2f364b] flex items-center justify-center font-bold text-emerald-400 text-[10px]">
                        {p.pin}
                      </span>
                      <span className="text-[#bac3dc] text-[10px] font-mono">{p.label}</span>
                    </div>
                  ))}
                </div>

                {/* Right Side: Pins 14 down to 8 */}
                <div className="space-y-2 text-right">
                  {currentChip.pinout.slice(7, 14).reverse().map(p => (
                    <div key={p.pin} className="flex items-center justify-end gap-2">
                      <span className="text-[#bac3dc] text-[10px] font-mono">{p.label}</span>
                      <span className="w-5 h-5 rounded bg-[#1e2230] border border-[#2f364b] flex items-center justify-center font-bold text-emerald-400 text-[10px]">
                        {p.pin}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Canonical Form Engineering Comparison (SOP vs POS) */}
      <section className="space-y-6">
        <div className="text-left pb-3 border-b border-[#202535]">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
            [ CURRICULUM FOUNDATIONS ]
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
            SOP & POS Canonical Synthesis
          </h3>
          <p className="text-xs text-[#828c9f] mt-1 font-mono">
            Every digital Boolean function can be realized in either canonical normal form.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          
          {/* SOP Architecture Card */}
          <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-6 space-y-4 hover:border-[#384059] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#14231b] text-emerald-400 border border-emerald-500/40">
                SUM OF PRODUCTS (SOP)
              </span>
              <span className="text-[10px] text-[#6d768f]">AND-OR LOGIC</span>
            </div>

            <div className="text-lg font-bold text-white font-mono">
              F = Σm(minterms) = (A' • B) + (A • B')
            </div>

            <p className="text-xs text-[#8a94ac] leading-relaxed font-sans">
              Minterms where output is HIGH (1) are formed using AND gates (SN7408) and inverters (SN7404), then gathered at an OR gate (SN7432). Standard representation for active-high digital assertions.
            </p>

            <div className="p-3 bg-[#0a0c12] border border-[#1b1f2c] rounded-lg text-xs space-y-1">
              <div className="text-white font-bold">Recommended Lab Bench Sequence:</div>
              <div className="text-[11px] text-[#78819a]">1. Invert inputs with SN7404</div>
              <div className="text-[11px] text-[#78819a]">2. Form product minterms on SN7408</div>
              <div className="text-[11px] text-[#78819a]">3. Combine products into SN7432 output LED</div>
            </div>
          </div>

          {/* POS Architecture Card */}
          <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-6 space-y-4 hover:border-[#384059] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#1c2130] text-blue-400 border border-blue-500/40">
                PRODUCT OF SUMS (POS)
              </span>
              <span className="text-[10px] text-[#6d768f]">OR-AND LOGIC</span>
            </div>

            <div className="text-lg font-bold text-white font-mono">
              F = ΠM(maxterms) = (A + B) • (A' + B')
            </div>

            <p className="text-xs text-[#8a94ac] leading-relaxed font-sans">
              Maxterms where output is LOW (0) are disjoined using OR gates (SN7432), then multiplied at an AND gate (SN7408). Mathematically dual to SOP via De Morgan's laws.
            </p>

            <div className="p-3 bg-[#0a0c12] border border-[#1b1f2c] rounded-lg text-xs space-y-1">
              <div className="text-white font-bold">Recommended Lab Bench Sequence:</div>
              <div className="text-[11px] text-[#78819a]">1. Disjoin inputs with SN7432</div>
              <div className="text-[11px] text-[#78819a]">2. Conjoin sum terms on SN7408</div>
              <div className="text-[11px] text-[#78819a]">3. Connect final product to output probe</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Lab Work Orders (Curriculum Experiments) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#202535]">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              [ WORK ORDER QUEUE ]
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-sans">
              Featured Laboratory Experiments
            </h3>
          </div>

          <button
            onClick={() => onNavigate('catalog')}
            className="btn-tactile text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>CATALOG ARCHIVE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-mono">
          {featuredExperiments.slice(0, 3).map((exp, idx) => (
            <div
              key={exp.id}
              onClick={() => onNavigate('experiment', exp.id)}
              className="bg-[#0f1118] border border-[#232737] hover:border-[#3d455e] rounded-xl p-5 space-y-4 cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-lg group btn-tactile"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold px-1.5 py-0.5 rounded bg-[#161a25] text-emerald-400 border border-emerald-500/30">
                    EXP-0{idx + 1} // {exp.canonicalForm}
                  </span>
                  <span className="text-[#78829b] uppercase">
                    TIER: {exp.difficulty}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors font-sans">
                  {exp.title}
                </h4>

                <p className="text-xs text-[#818b9f] line-clamp-2 leading-relaxed font-sans">
                  {exp.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1a1e2b] flex items-center justify-between text-xs">
                <div className="text-emerald-400 font-bold text-[11px]">
                  F = {exp.targetExpression}
                </div>
                <div className="flex items-center gap-1 text-[#8691ab] group-hover:text-white transition-colors text-[11px]">
                  <span>ENTER BENCH</span>
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
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
