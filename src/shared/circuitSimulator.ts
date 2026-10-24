/**
 * 3-Valued Digital Logic Simulator & Netlist Fixpoint Solver
 * Ported and verified against ARLab.Simulation.DigitalLogicSimulator
 */

import { LogicValue, notLogic, andLogic, orLogic, IC_DEFINITIONS } from './logic.ts';

export interface CircuitNetlist {
  powerOn: boolean;
  inputs: Record<string, LogicValue>; // 'A', 'B', 'C'
  chips: {
    id: string;
    partNumber: '7404' | '7408' | '7432';
    vccConnected: boolean;
    gndConnected: boolean;
  }[];
  wires: {
    from: string; // e.g. "input:A", "chip:IC1:1Y", "chip:IC2:1A", "output:LED"
    to: string;
  }[];
}

export interface SimulationResult {
  status: 'Converged' | 'Unstable' | 'NotPowered' | 'FloatingNet';
  iterations: number;
  outputLed: LogicValue;
  pinValues: Record<string, LogicValue>;
  diagnostic: string;
}

export function simulateCircuit(netlist: CircuitNetlist): SimulationResult {
  if (!netlist.powerOn) {
    return {
      status: 'NotPowered',
      iterations: 0,
      outputLed: LogicValue.Undefined,
      pinValues: {},
      diagnostic: 'Main DC power supply is switched OFF. All terminals are floating.'
    };
  }

  // Pin state storage
  const pinValues: Record<string, LogicValue> = {};

  // Initialize all chip outputs to Undefined
  for (const chip of netlist.chips) {
    const def = IC_DEFINITIONS[chip.partNumber];
    if (!def) continue;
    for (const g of def.gates) {
      pinValues[`${chip.id}:${g.out}`] = LogicValue.Undefined;
      pinValues[`${chip.id}:${g.inA}`] = LogicValue.Undefined;
      if (g.inB) pinValues[`${chip.id}:${g.inB}`] = LogicValue.Undefined;
    }
  }

  // Propagate inputs to wires
  const maxIterations = 20;
  let iterations = 0;
  let changed = true;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // 1. Propagate input signals across wires
    for (const wire of netlist.wires) {
      let sourceVal = LogicValue.Undefined;

      if (wire.from.startsWith('input:')) {
        const varName = wire.from.split(':')[1];
        sourceVal = netlist.inputs[varName] ?? LogicValue.Low;
      } else if (wire.from.startsWith('chip:')) {
        const key = wire.from.replace('chip:', '');
        sourceVal = pinValues[key] ?? LogicValue.Undefined;
      } else if (wire.from === 'vcc') {
        sourceVal = LogicValue.High;
      } else if (wire.from === 'gnd') {
        sourceVal = LogicValue.Low;
      }

      if (wire.to.startsWith('chip:')) {
        const destKey = wire.to.replace('chip:', '');
        if (pinValues[destKey] !== sourceVal) {
          pinValues[destKey] = sourceVal;
          changed = true;
        }
      }
    }

    // 2. Evaluate IC internal gates
    for (const chip of netlist.chips) {
      const isPowered = chip.vccConnected && chip.gndConnected;
      const def = IC_DEFINITIONS[chip.partNumber];
      if (!def) continue;

      for (const g of def.gates) {
        const outKey = `${chip.id}:${g.out}`;
        const inAVal = pinValues[`${chip.id}:${g.inA}`] ?? LogicValue.Undefined;
        const inBVal = pinValues[`${chip.id}:${g.inB}`] ?? LogicValue.Undefined;

        let computedOut = LogicValue.Undefined;

        if (isPowered) {
          if (def.kind === 'Not') {
            computedOut = notLogic(inAVal);
          } else if (def.kind === 'And') {
            computedOut = andLogic(inAVal, inBVal);
          } else if (def.kind === 'Or') {
            computedOut = orLogic(inAVal, inBVal);
          }
        }

        if (pinValues[outKey] !== computedOut) {
          pinValues[outKey] = computedOut;
          changed = true;
        }
      }
    }
  }

  // Determine LED output
  let ledVal = LogicValue.Undefined;
  const ledWire = netlist.wires.find(w => w.to === 'output:LED');

  if (ledWire) {
    if (ledWire.from.startsWith('input:')) {
      const varName = ledWire.from.split(':')[1];
      ledVal = netlist.inputs[varName] ?? LogicValue.Low;
    } else if (ledWire.from.startsWith('chip:')) {
      const key = ledWire.from.replace('chip:', '');
      ledVal = pinValues[key] ?? LogicValue.Undefined;
    }
  }

  const isStable = iterations < maxIterations;

  return {
    status: isStable ? 'Converged' : 'Unstable',
    iterations,
    outputLed: ledVal,
    pinValues,
    diagnostic: isStable
      ? `Circuit evaluated in ${iterations} fixpoint iterations.`
      : 'Unstable oscillation or feedback loop detected in netlist.'
  };
}
