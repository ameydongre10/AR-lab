/**
 * 3-Valued Digital Logic Types and Operations
 * Ported and verified against ARLab.Electronics.LogicValue
 */

export const LogicValue = {
  Low: 0,
  High: 1,
  Undefined: 2
} as const;

export type LogicValue = typeof LogicValue[keyof typeof LogicValue];

export function notLogic(v: LogicValue): LogicValue {
  if (v === LogicValue.Low) return LogicValue.High;
  if (v === LogicValue.High) return LogicValue.Low;
  return LogicValue.Undefined;
}

export function andLogic(a: LogicValue, b: LogicValue): LogicValue {
  if (a === LogicValue.Low || b === LogicValue.Low) return LogicValue.Low;
  if (a === LogicValue.High && b === LogicValue.High) return LogicValue.High;
  return LogicValue.Undefined;
}

export function orLogic(a: LogicValue, b: LogicValue): LogicValue {
  if (a === LogicValue.High || b === LogicValue.High) return LogicValue.High;
  if (a === LogicValue.Low && b === LogicValue.Low) return LogicValue.Low;
  return LogicValue.Undefined;
}

export function logicToString(v: LogicValue): string {
  switch (v) {
    case LogicValue.Low: return '0';
    case LogicValue.High: return '1';
    default: return 'X';
  }
}

export function isDriven(v: LogicValue): boolean {
  return v === LogicValue.Low || v === LogicValue.High;
}

export interface GateSpec {
  index: number;
  inA: string;
  inB: string;
  out: string;
}

export interface IcDefinition {
  partNumber: string;
  name: string;
  description: string;
  kind: 'Not' | 'And' | 'Or';
  vccPin: number;
  gndPin: number;
  gates: GateSpec[];
  pinMap: Record<string, number>;
  signalAtPin: (pin: number) => string | null;
}

const INVERTER_GATES: GateSpec[] = [
  { index: 0, inA: '1A', inB: '1A', out: '1Y' },
  { index: 1, inA: '2A', inB: '2A', out: '2Y' },
  { index: 2, inA: '3A', inB: '3A', out: '3Y' },
  { index: 3, inA: '4A', inB: '4A', out: '4Y' },
  { index: 4, inA: '5A', inB: '5A', out: '5Y' },
  { index: 5, inA: '6A', inB: '6A', out: '6Y' }
];

const QUAD_GATES: GateSpec[] = [
  { index: 0, inA: '1A', inB: '1B', out: '1Y' },
  { index: 1, inA: '2A', inB: '2B', out: '2Y' },
  { index: 2, inA: '3A', inB: '3B', out: '3Y' },
  { index: 3, inA: '4A', inB: '4B', out: '4Y' }
];

const INVERTER_PIN_MAP: Record<string, number> = {
  '1A': 1, '1Y': 2, '2A': 3, '2Y': 4, '3A': 5, '3Y': 6,
  'GND': 7, '4Y': 8, '4A': 9, '5Y': 10, '5A': 11, '6Y': 12,
  '6A': 13, 'VCC': 14
};

const QUAD_PIN_MAP: Record<string, number> = {
  '1A': 1, '1B': 2, '1Y': 3, '2A': 4, '2B': 5, '2Y': 6,
  'GND': 7, '3Y': 8, '3A': 9, '3B': 10, '4Y': 11, '4A': 12,
  '4B': 13, 'VCC': 14
};

function makeSignalAtPin(pinMap: Record<string, number>) {
  return (pin: number): string | null => {
    for (const [sig, p] of Object.entries(pinMap)) {
      if (p === pin) return sig;
    }
    return null;
  };
}

export const IC_DEFINITIONS: Record<string, IcDefinition> = {
  '7404': {
    partNumber: '7404',
    name: 'Hex Inverter',
    description: 'Six independent NOT gates in a 14-pin DIP package.',
    kind: 'Not',
    vccPin: 14,
    gndPin: 7,
    gates: INVERTER_GATES,
    pinMap: INVERTER_PIN_MAP,
    signalAtPin: makeSignalAtPin(INVERTER_PIN_MAP)
  },
  '7408': {
    partNumber: '7408',
    name: 'Quad 2-Input AND Gate',
    description: 'Four independent 2-input AND gates in a 14-pin DIP package.',
    kind: 'And',
    vccPin: 14,
    gndPin: 7,
    gates: QUAD_GATES,
    pinMap: QUAD_PIN_MAP,
    signalAtPin: makeSignalAtPin(QUAD_PIN_MAP)
  },
  '7432': {
    partNumber: '7432',
    name: 'Quad 2-Input OR Gate',
    description: 'Four independent 2-input OR gates in a 14-pin DIP package.',
    kind: 'Or',
    vccPin: 14,
    gndPin: 7,
    gates: QUAD_GATES,
    pinMap: QUAD_PIN_MAP,
    signalAtPin: makeSignalAtPin(QUAD_PIN_MAP)
  }
};
