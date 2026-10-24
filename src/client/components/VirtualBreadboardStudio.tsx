import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Power, CheckCircle, XCircle, HelpCircle, Save, Sparkles, RefreshCw, Cpu, Activity, Lightbulb } from 'lucide-react';
import { Experiment } from '../types/index.ts';
import { LogicValue, logicToString } from '../../shared/logic.ts';
import { simulateCircuit, CircuitNetlist } from '../../shared/circuitSimulator.ts';
import { api } from '../services/api.ts';

interface VirtualBreadboardStudioProps {
  experiment: Experiment;
  onSessionSaved?: () => void;
}

export const VirtualBreadboardStudio: React.FC<VirtualBreadboardStudioProps> = ({
  experiment,
  onSessionSaved
}) => {
  const [powerOn, setPowerOn] = useState<boolean>(true);
  const [inputStates, setInputStates] = useState<Record<string, LogicValue>>({
    A: LogicValue.Low,
    B: LogicValue.Low,
    S: LogicValue.Low,
    C: LogicValue.Low
  });
  const [testedRows, setTestedRows] = useState<Record<string, { expected: boolean; actual: boolean; passed: boolean }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [studentName, setStudentName] = useState('Lab Student');

  const variables = experiment.truthTableTarget?.variables || experiment.defaultInputs || ['A', 'B'];

  // Construct circuit netlist from experiment requirements
  const buildCurrentNetlist = (): CircuitNetlist => {
    const chips: CircuitNetlist['chips'] = experiment.requiredIcs.map((part, idx) => ({
      id: `IC${idx + 1}_${part}`,
      partNumber: part,
      vccConnected: powerOn,
      gndConnected: powerOn
    }));

    // Example wire routing for XOR SOP / POS / general
    const wires: CircuitNetlist['wires'] = [];

    if (experiment.canonicalForm === 'SOP') {
      // Inputs to Inverters and AND gates
      wires.push(
        { from: 'input:A', to: 'chip:IC1_7404:1A' },
        { from: 'input:B', to: 'chip:IC1_7404:2A' },
        { from: 'chip:IC1_7404:1Y', to: 'chip:IC2_7408:1A' },
        { from: 'input:B', to: 'chip:IC2_7408:1B' },
        { from: 'input:A', to: 'chip:IC2_7408:2A' },
        { from: 'chip:IC1_7404:2Y', to: 'chip:IC2_7408:2B' },
        { from: 'chip:IC2_7408:1Y', to: 'chip:IC3_7432:1A' },
        { from: 'chip:IC2_7408:2Y', to: 'chip:IC3_7432:1B' },
        { from: 'chip:IC3_7432:1Y', to: 'output:LED' }
      );
    } else {
      // POS wiring
      wires.push(
        { from: 'input:A', to: 'chip:IC3_7432:1A' },
        { from: 'input:B', to: 'chip:IC3_7432:1B' },
        { from: 'input:A', to: 'chip:IC1_7404:1A' },
        { from: 'input:B', to: 'chip:IC1_7404:2A' },
        { from: 'chip:IC1_7404:1Y', to: 'chip:IC3_7432:2A' },
        { from: 'chip:IC1_7404:2Y', to: 'chip:IC3_7432:2B' },
        { from: 'chip:IC3_7432:1Y', to: 'chip:IC2_7408:1A' },
        { from: 'chip:IC3_7432:2Y', to: 'chip:IC2_7408:1B' },
        { from: 'chip:IC2_7408:1Y', to: 'output:LED' }
      );
    }

    return {
      powerOn,
      inputs: inputStates,
      chips,
      wires
    };
  };

  const simulation = simulateCircuit(buildCurrentNetlist());

  // Calculate current active binary key, e.g. "01"
  const currentBinary = variables.map(v => (inputStates[v] === LogicValue.High ? '1' : '0')).join('');

  // Find expected output for current binary valuation
  const targetRow = experiment.truthTableTarget?.rows.find(r => r.binary === currentBinary);
  const expectedOutput = targetRow ? targetRow.output : false;
  const currentActualOutput = simulation.outputLed === LogicValue.High;
  const currentIsUndef = simulation.outputLed === LogicValue.Undefined;
  const currentMatches = !currentIsUndef && currentActualOutput === expectedOutput;

  // Track tested rows
  useEffect(() => {
    if (powerOn && !currentIsUndef) {
      setTestedRows(prev => {
        const next = {
          ...prev,
          [currentBinary]: {
            expected: expectedOutput,
            actual: currentActualOutput,
            passed: currentMatches
          }
        };

        // If all rows are now tested and passed, celebrate!
        const totalRows = experiment.truthTableTarget?.rows.length || 4;
        const allPassed = Object.keys(next).length === totalRows && Object.values(next).every(r => r.passed);
        if (allPassed && Object.keys(prev).length < totalRows) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        }

        return next;
      });
    }
  }, [currentBinary, simulation.outputLed, powerOn]);

  const toggleInput = (v: string) => {
    setInputStates(prev => ({
      ...prev,
      [v]: prev[v] === LogicValue.High ? LogicValue.Low : LogicValue.High
    }));
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const rows = experiment.truthTableTarget?.rows.map(targetR => {
        const test = testedRows[targetR.binary];
        return {
          binary: targetR.binary,
          inputs: targetR.inputs,
          expected: targetR.output,
          actual: test ? test.actual : false,
          passed: test ? test.passed : false
        };
      }) || [];

      await api.createSession({
        experimentId: experiment.id,
        studentName,
        netlistState: {
          powerOn,
          canonicalForm: experiment.canonicalForm,
          verifiedAt: new Date().toISOString()
        },
        truthTableResults: rows,
        notes: `Simulated in Virtual Breadboard Studio. Evaluated ${rows.length} rows.`
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onSessionSaved) onSessionSaved();
    } catch (err) {
      console.error('Failed to save lab session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalRowsCount = experiment.truthTableTarget?.rows.length || 4;
  const verifiedCount = Object.values(testedRows).filter(r => r.passed).length;
  const progressPercent = Math.round((verifiedCount / totalRowsCount) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Interactive Virtual Breadboard Studio</h3>
            <p className="text-xs text-slate-400">
              Deterministic 3-Valued Fixpoint Logic Simulator • TTL 7400 DIP Packages
            </p>
          </div>
        </div>

        {/* Power Switch & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPowerOn(!powerOn)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer shadow-lg ${
              powerOn
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/10'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10'
            }`}
          >
            <Power className="w-4 h-4" />
            DC Power: {powerOn ? '+5V ACTIVE' : 'OFF (0V)'}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Switches & Power Controls */}
        <div className="lg:col-span-4 bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Primary Logic Inputs
            </h4>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Pattern: {currentBinary}
            </span>
          </div>

          <div className="space-y-3">
            {variables.map(v => {
              const val = inputStates[v];
              const isHigh = val === LogicValue.High;
              return (
                <div
                  key={v}
                  className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-sm text-cyan-300">
                      {v}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-slate-200">Logic Variable {v}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {isHigh ? '+5V DC (HIGH)' : '0V GND (LOW)'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleInput(v)}
                    disabled={!powerOn}
                    className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      isHigh ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-[10px] font-bold text-slate-900 ${
                        isHigh ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    >
                      {isHigh ? '1' : '0'}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Logic Output Indicator LED */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Output Probe & Logic LED
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-300">Terminal: F (LED)</span>
                <div className="text-[10px] font-mono text-slate-500">
                  Status: {currentIsUndef ? 'UNDEFINED (X)' : currentActualOutput ? 'HIGH (1)' : 'LOW (0)'}
                </div>
              </div>

              {/* Glowing LED Element */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center font-bold text-xs ${
                    currentIsUndef
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      : currentActualOutput
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                      : 'bg-slate-800 border-slate-700 text-slate-500 shadow-none'
                  }`}
                >
                  {currentIsUndef ? '?' : currentActualOutput ? '1' : '0'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Breadboard Schematic & Live Truth Table Verification */}
        <div className="lg:col-span-8 space-y-5">
          {/* Virtual Breadboard Topology Card */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seated TTL 7400 IC Architecture ({experiment.canonicalForm} Topology)
              </h4>
              <span className="text-[11px] text-cyan-400 font-mono">
                {simulation.iterations} fixpoint iterations
              </span>
            </div>

            {/* Visual Chip Rack */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {experiment.requiredIcs.map((ic, idx) => (
                <div
                  key={ic}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-3 relative overflow-hidden group hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold font-mono text-cyan-400">SN{ic}N</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">DIP-14</span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium">
                    {ic === '7404' ? 'Hex Inverter' : ic === '7408' ? 'Quad AND Gate' : 'Quad OR Gate'}
                  </div>

                  {/* Pin visual indication */}
                  <div className="mt-3 flex justify-between items-center text-[9px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
                    <span>Pin 14: VCC (+5V)</span>
                    <span>Pin 7: GND</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canonical Truth Table Verification Card */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Canonical Truth Table Verification
                </h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Target: {experiment.targetExpression} ({experiment.canonicalForm})
                </p>
              </div>

              {/* Progress Pill */}
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-slate-300">
                  {verifiedCount} / {totalRowsCount} Verified
                </span>
                <span className={`text-xs font-bold font-mono ${progressPercent === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Truth Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    {variables.map(v => (
                      <th key={v} className="px-3.5 py-2.5 font-bold text-center text-cyan-400">
                        {v}
                      </th>
                    ))}
                    <th className="px-3.5 py-2.5 font-bold text-center text-slate-300">Expected (F)</th>
                    <th className="px-3.5 py-2.5 font-bold text-center text-slate-300">Simulated</th>
                    <th className="px-3.5 py-2.5 font-bold text-center">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {experiment.truthTableTarget?.rows.map(row => {
                    const isActive = row.binary === currentBinary;
                    const test = testedRows[row.binary];
                    const isPassed = test && test.passed;

                    return (
                      <tr
                        key={row.binary}
                        className={`transition-colors ${
                          isActive
                            ? 'bg-cyan-500/10 font-semibold'
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        {variables.map(v => (
                          <td key={v} className="px-3.5 py-2 text-center text-slate-300">
                            {row.inputs[v] ? '1' : '0'}
                          </td>
                        ))}
                        <td className="px-3.5 py-2 text-center font-bold text-slate-200">
                          {row.output ? '1' : '0'}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          {isActive ? (
                            <span className={currentIsUndef ? 'text-amber-400' : currentActualOutput ? 'text-emerald-400' : 'text-slate-400'}>
                              {currentIsUndef ? 'X' : currentActualOutput ? '1' : '0'}
                            </span>
                          ) : test ? (
                            <span className={test.actual ? 'text-emerald-400' : 'text-slate-400'}>
                              {test.actual ? '1' : '0'}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              PASS
                            </span>
                          ) : isActive && !currentMatches ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                              <XCircle className="w-3.5 h-3.5" />
                              MISMATCH
                            </span>
                          ) : (
                            <span className="text-slate-600">Pending</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Save Session CTA Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Student or Lab Group Name"
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 animate-fade-in">
                    <CheckCircle className="w-4 h-4" />
                    Session Persisted to Database!
                  </span>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Record Verified Lab Run'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
