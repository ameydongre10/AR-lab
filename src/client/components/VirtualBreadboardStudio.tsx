import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Power, CheckCircle, XCircle, Save, RefreshCw, Cpu, Activity, Lightbulb, Zap, ShieldCheck } from 'lucide-react';
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
  const [studentName, setStudentName] = useState('EE Lab Group 1');

  const variables = experiment.truthTableTarget?.variables || experiment.defaultInputs || ['A', 'B'];

  // Construct circuit netlist from experiment requirements
  const buildCurrentNetlist = (): CircuitNetlist => {
    const chips: CircuitNetlist['chips'] = experiment.requiredIcs.map((part, idx) => ({
      id: `IC${idx + 1}_${part}`,
      partNumber: part,
      vccConnected: powerOn,
      gndConnected: powerOn
    }));

    const wires: CircuitNetlist['wires'] = [];

    if (experiment.canonicalForm === 'SOP') {
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

  // Current binary pattern, e.g. "01"
  const currentBinary = variables.map(v => (inputStates[v] === LogicValue.High ? '1' : '0')).join('');

  // Target expected output
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

        const totalRows = experiment.truthTableTarget?.rows.length || 4;
        const allPassed = Object.keys(next).length === totalRows && Object.values(next).every(r => r.passed);
        if (allPassed && Object.keys(prev).length < totalRows) {
          confetti({
            particleCount: 75,
            spread: 55,
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

  const handleResetVerification = () => {
    setTestedRows({});
    setSaveSuccess(false);
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
        notes: `Verified on Swiss Precision Hardware Bench DB-7400 (${simulation.iterations} fixpoint cycles)`
      });

      setSaveSuccess(true);
      if (onSessionSaved) onSessionSaved();
    } catch (err) {
      console.error('Failed to record session:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalRowsCount = experiment.truthTableTarget?.rows.length || 4;
  const verifiedCount = Object.values(testedRows).filter(r => r.passed).length;
  const progressPercent = Math.round((verifiedCount / totalRowsCount) * 100);

  // Digital Voltmeter voltage calculation
  const busVoltage = powerOn ? 5.02 : 0.00;
  const probeVoltage = !powerOn || currentIsUndef ? 0.00 : currentActualOutput ? 4.95 : 0.08;

  return (
    <div className="bg-[#0e1017] border border-[#232737] rounded-xl shadow-2xl overflow-hidden font-mono">
      
      {/* 1. Milled Aluminum Chassis Instrument Header */}
      <div className="bg-[#12141c] border-b border-[#222636] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#171a25] border border-[#2c3245] flex items-center justify-center text-emerald-400 shadow-inner">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wider uppercase">
                DIGITAL LOGIC BENCH // DB-7400
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1b202e] text-emerald-400 border border-emerald-500/30">
                {experiment.canonicalForm} TOPOLOGY
              </span>
            </div>
            <p className="text-[11px] text-[#78819a]">
              Deterministic 3-Valued Fixpoint Solver • {simulation.iterations} Cycles
            </p>
          </div>
        </div>

        {/* Master Power Toggle & Digital Voltmeter Readout */}
        <div className="flex items-center gap-4">
          {/* Voltmeter Display Panel */}
          <div className="bg-[#090b0f] border border-[#252a3b] px-3 py-1.5 rounded-lg flex items-center gap-3">
            <div className="text-[10px] text-[#717a94] uppercase tracking-wider font-semibold">
              VCC BUS:
            </div>
            <div className={`text-sm font-mono font-black tabular-nums ${powerOn ? 'text-emerald-400 glow-phosphor-sm' : 'text-rose-500'}`}>
              {busVoltage.toFixed(2)}V DC
            </div>
          </div>

          {/* Heavy-Duty Industrial Rocker Switch */}
          <button
            onClick={() => setPowerOn(!powerOn)}
            className={`btn-tactile flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              powerOn
                ? 'bg-[#15241d] text-emerald-400 border-emerald-500/50 hover:bg-[#1a2f25]'
                : 'bg-[#261517] text-rose-400 border-rose-500/50 hover:bg-[#331c20]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${powerOn ? 'bg-emerald-400 glow-phosphor-sm' : 'bg-rose-500'}`}></span>
            <Power className="w-3.5 h-3.5" />
            <span>{powerOn ? 'POWER: ACTIVE' : 'POWER: OFF'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Instrument Layout */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-grid-subtle">
        
        {/* Left Rack: Primary Signal Generators & Voltage Probe (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Primary Logic Inputs Rack */}
          <div className="bg-[#12141c] border border-[#232737] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2231]">
              <span className="text-[11px] font-bold text-[#838da7] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                DIGITAL INPUT BUS
              </span>
              <span className="text-[11px] text-emerald-300 font-bold bg-[#1a2130] px-2 py-0.5 rounded border border-[#2b354e]">
                REG: [{currentBinary}]₂
              </span>
            </div>

            <div className="space-y-2.5">
              {variables.map(v => {
                const val = inputStates[v];
                const isHigh = val === LogicValue.High;
                return (
                  <div
                    key={v}
                    className="flex items-center justify-between p-2.5 bg-[#0a0c12] border border-[#1e2230] rounded-lg hover:border-[#2e354a] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-[#151822] border border-[#2b3144] flex items-center justify-center font-bold text-xs text-white">
                        {v}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#d2d8e9]">
                          Variable {v}
                        </div>
                        <div className="text-[10px] text-[#6d768f]">
                          {isHigh ? '+5.0V (HIGH)' : '0.0V (LOW)'}
                        </div>
                      </div>
                    </div>

                    {/* Industrial Rocker Toggle Control */}
                    <button
                      onClick={() => toggleInput(v)}
                      disabled={!powerOn}
                      className={`btn-tactile px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isHigh
                          ? 'bg-[#152a20] text-emerald-300 border-emerald-500/50 hover:bg-[#1b3528]'
                          : 'bg-[#181a23] text-[#717a94] border-[#262c3e] hover:bg-[#202330]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-emerald-400 glow-phosphor-sm' : 'bg-[#4b5368]'}`}></span>
                      <span>{isHigh ? 'BIT 1' : 'BIT 0'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logic Output Probe & 5mm Phosphor LED */}
          <div className="bg-[#12141c] border border-[#232737] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1f2231]">
              <span className="text-[11px] font-bold text-[#838da7] uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                OUTPUT TEST PROBE (LED)
              </span>
              <span className="text-[10px] text-[#717a94]">
                MEASURED: <span className="text-white font-bold">{probeVoltage.toFixed(2)}V</span>
              </span>
            </div>

            <div className="p-3 bg-[#0a0c12] border border-[#1e2230] rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Logic Terminal F</div>
                <div className="text-[10px] text-[#717a94] mt-0.5">
                  State: {currentIsUndef ? 'UNDEFINED (X)' : currentActualOutput ? 'LOGIC HIGH (1)' : 'LOGIC LOW (0)'}
                </div>
              </div>

              {/* Realistic 5mm Diffused Laboratory LED */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  {/* Outer bezel */}
                  <div className="w-9 h-9 rounded-full bg-[#1b1e2a] border-2 border-[#383e54] flex items-center justify-center shadow-inner">
                    {/* Inner glowing lens */}
                    <div
                      className={`w-6 h-6 rounded-full transition-all duration-150 flex items-center justify-center text-[10px] font-black ${
                        currentIsUndef
                          ? 'bg-amber-500/30 border border-amber-400 text-amber-300 glow-amber-sm'
                          : currentActualOutput
                          ? 'bg-emerald-400 border border-emerald-200 text-[#090b10] glow-phosphor-md'
                          : 'bg-[#181a23] border border-[#2b3044] text-[#555d73]'
                      }`}
                    >
                      {currentIsUndef ? 'X' : currentActualOutput ? '1' : '0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Oscilloscope Timing Waveform Preview */}
          <div className="bg-[#12141c] border border-[#232737] rounded-xl p-4 crt-screen">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f2231]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" />
                SCOPE TRACE // DIGITAL WAVEFORMS
              </span>
              <span className="text-[9px] text-[#636c84]">5ns / DIV</span>
            </div>

            {/* Simulated Live Logic Waveform Canvas */}
            <div className="h-20 bg-[#07090d] border border-[#1a1e2b] rounded p-2 flex flex-col justify-around relative">
              {/* Grid lines */}
              <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-40"></div>

              {/* Input A trace */}
              <div className="flex items-center gap-2 text-[9px] relative z-10">
                <span className="w-5 text-[#8892ad] font-bold">IN·A</span>
                <div className="flex-1 flex items-center">
                  <svg className="w-full h-4 stroke-cyan-400 stroke-[1.5] fill-none" viewBox="0 0 200 20" preserveAspectRatio="none">
                    {inputStates.A === LogicValue.High ? (
                      <path d="M 0 5 L 80 5 L 80 5 L 200 5" />
                    ) : (
                      <path d="M 0 15 L 80 15 L 80 15 L 200 15" />
                    )}
                  </svg>
                </div>
                <span className={`text-[9px] font-bold ${inputStates.A === LogicValue.High ? 'text-cyan-400' : 'text-[#555e75]'}`}>
                  {inputStates.A === LogicValue.High ? '1' : '0'}
                </span>
              </div>

              {/* Input B trace */}
              <div className="flex items-center gap-2 text-[9px] relative z-10">
                <span className="w-5 text-[#8892ad] font-bold">IN·B</span>
                <div className="flex-1 flex items-center">
                  <svg className="w-full h-4 stroke-amber-400 stroke-[1.5] fill-none" viewBox="0 0 200 20" preserveAspectRatio="none">
                    {inputStates.B === LogicValue.High ? (
                      <path d="M 0 5 L 120 5 L 120 5 L 200 5" />
                    ) : (
                      <path d="M 0 15 L 120 15 L 120 15 L 200 15" />
                    )}
                  </svg>
                </div>
                <span className={`text-[9px] font-bold ${inputStates.B === LogicValue.High ? 'text-amber-400' : 'text-[#555e75]'}`}>
                  {inputStates.B === LogicValue.High ? '1' : '0'}
                </span>
              </div>

              {/* Output LED trace */}
              <div className="flex items-center gap-2 text-[9px] relative z-10 border-t border-[#171a26] pt-1">
                <span className="w-5 text-emerald-400 font-bold">OUT</span>
                <div className="flex-1 flex items-center">
                  <svg className="w-full h-4 stroke-emerald-400 stroke-[2] fill-none" viewBox="0 0 200 20" preserveAspectRatio="none">
                    {currentActualOutput ? (
                      <path d="M 0 4 L 200 4" />
                    ) : (
                      <path d="M 0 16 L 200 16" />
                    )}
                  </svg>
                </div>
                <span className={`text-[9px] font-bold ${currentActualOutput ? 'text-emerald-400' : 'text-[#555e75]'}`}>
                  {currentIsUndef ? 'X' : currentActualOutput ? '1' : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rack: Breadboard IC Bay & Calibrated Truth Table (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Seated 7400 TTL IC Packages */}
          <div className="bg-[#12141c] border border-[#232737] rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1f2231]">
              <span className="text-[11px] font-bold text-[#838da7] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-400" />
                SEATED 7400 TTL DIP PACKAGES (DIP-14)
              </span>
              <span className="text-[10px] text-[#717a94]">
                VCC: PIN 14 • GND: PIN 7
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {experiment.requiredIcs.map((ic, idx) => (
                <div
                  key={ic}
                  className="bg-[#090b0f] border border-[#1f2332] rounded-lg p-3 relative hover:border-[#384059] transition-colors"
                >
                  {/* DIP Notch at top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#1a1e2b] rounded-b border-b border-x border-[#333b52]"></div>
                  
                  <div className="flex items-center justify-between mb-1.5 pt-1">
                    <span className="text-xs font-bold font-mono text-emerald-400">
                      SN{ic}N
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161a25] text-[#7e88a3] border border-[#262c3e]">
                      IC{idx + 1}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#cfd5e6] font-semibold">
                    {ic === '7404' ? 'Hex Inverter (NOT)' : ic === '7408' ? 'Quad 2-Input AND' : 'Quad 2-Input OR'}
                  </div>

                  {/* Pin status strip */}
                  <div className="mt-3 pt-2 border-t border-[#1a1d29] flex items-center justify-between text-[9px] text-[#6d768e]">
                    <span className="flex items-center gap-1">
                      <span className={`w-1 h-1 rounded-full ${powerOn ? 'bg-amber-400' : 'bg-[#3e4558]'}`}></span>
                      Pin 14: +5V
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-1 h-1 rounded-full ${powerOn ? 'bg-blue-400' : 'bg-[#3e4558]'}`}></span>
                      Pin 7: GND
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calibrated Truth Table Verification Sheet */}
          <div className="bg-[#12141c] border border-[#232737] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1f2231]">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  CANONICAL TRUTH TABLE CALIBRATION MATRIX
                </h4>
                <p className="text-[11px] text-[#7d87a1] mt-0.5">
                  Formula: <span className="text-emerald-400 font-bold">{experiment.targetExpression}</span> ({experiment.canonicalForm})
                </p>
              </div>

              {/* Progress Pill */}
              <div className="flex items-center gap-2 bg-[#090b0f] border border-[#23283a] px-3 py-1.5 rounded-lg">
                <span className="text-xs text-[#8993ac]">
                  Verified: <span className="text-white font-bold">{verifiedCount}/{totalRowsCount}</span>
                </span>
                <span className={`text-xs font-bold ${progressPercent === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  [{progressPercent}%]
                </span>
              </div>
            </div>

            {/* Verification Table */}
            <div className="overflow-x-auto rounded-lg border border-[#1f2332]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#090b0f] text-[#717a94] border-b border-[#1f2332]">
                  <tr>
                    {variables.map(v => (
                      <th key={v} className="px-3.5 py-2 font-bold text-center text-[#9ea7bf]">
                        VAR {v}
                      </th>
                    ))}
                    <th className="px-3.5 py-2 font-bold text-center text-white">EXPECTED (F)</th>
                    <th className="px-3.5 py-2 font-bold text-center text-emerald-400">MEASURED</th>
                    <th className="px-3.5 py-2 font-bold text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171a26]">
                  {experiment.truthTableTarget?.rows.map(row => {
                    const isActive = row.binary === currentBinary;
                    const test = testedRows[row.binary];
                    const isPassed = test && test.passed;

                    return (
                      <tr
                        key={row.binary}
                        className={`transition-colors ${
                          isActive
                            ? 'bg-[#182030] font-bold text-white'
                            : 'hover:bg-[#151722]'
                        }`}
                      >
                        {variables.map(v => (
                          <td key={v} className="px-3.5 py-2 text-center text-[#cfd5e6]">
                            {row.inputs[v] ? '1' : '0'}
                          </td>
                        ))}
                        <td className="px-3.5 py-2 text-center font-bold text-white">
                          {row.output ? '1' : '0'}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          {isActive ? (
                            <span className={currentIsUndef ? 'text-amber-400' : currentActualOutput ? 'text-emerald-400' : 'text-[#848ea6]'}>
                              {currentIsUndef ? 'X' : currentActualOutput ? '1' : '0'}
                            </span>
                          ) : test ? (
                            <span className={test.actual ? 'text-emerald-400' : 'text-[#848ea6]'}>
                              {test.actual ? '1' : '0'}
                            </span>
                          ) : (
                            <span className="text-[#434b61]">-</span>
                          )}
                        </td>
                        <td className="px-3.5 py-2 text-center">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                              <CheckCircle className="w-3 h-3" />
                              PASS
                            </span>
                          ) : isActive && !currentMatches ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                              <XCircle className="w-3 h-3" />
                              FAULT
                            </span>
                          ) : (
                            <span className="text-[#434b61]">WAITING</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Committal & Session Signature Bar */}
            <div className="pt-3 border-t border-[#1f2231] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6d768f]">OPERATOR:</span>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder="Student or Lab Group ID"
                  className="bg-[#090b0f] border border-[#252a3b] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#515970] focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={handleResetVerification}
                  title="Reset tested states"
                  className="btn-tactile p-1.5 text-[#737c94] hover:text-white bg-[#151822] border border-[#242939] rounded-lg cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    VERIFICATION PERSISTED
                  </span>
                )}
                <button
                  onClick={handleSaveSession}
                  disabled={isSaving}
                  className="btn-tactile flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#222838] to-[#151822] hover:from-[#2c3347] hover:to-[#1b1f2c] text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSaving ? 'COMMITTING...' : 'RECORD VERIFIED RUN'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
