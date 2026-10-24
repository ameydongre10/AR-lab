import test from 'node:test';
import assert from 'node:assert/strict';
import { LogicValue, notLogic, andLogic, orLogic, logicToString, IC_DEFINITIONS } from '../src/shared/logic.ts';
import { BooleanExpression } from '../src/shared/booleanExpression.ts';
import { simulateCircuit } from '../src/shared/circuitSimulator.ts';

test('3-Valued Logic: Fundamental Operations', () => {
  // NOT
  assert.equal(notLogic(LogicValue.Low), LogicValue.High);
  assert.equal(notLogic(LogicValue.High), LogicValue.Low);
  assert.equal(notLogic(LogicValue.Undefined), LogicValue.Undefined);

  // AND
  assert.equal(andLogic(LogicValue.Low, LogicValue.Low), LogicValue.Low);
  assert.equal(andLogic(LogicValue.Low, LogicValue.High), LogicValue.Low);
  assert.equal(andLogic(LogicValue.High, LogicValue.Low), LogicValue.Low);
  assert.equal(andLogic(LogicValue.High, LogicValue.High), LogicValue.High);
  assert.equal(andLogic(LogicValue.High, LogicValue.Undefined), LogicValue.Undefined);
  assert.equal(andLogic(LogicValue.Low, LogicValue.Undefined), LogicValue.Low); // Dominant low

  // OR
  assert.equal(orLogic(LogicValue.Low, LogicValue.Low), LogicValue.Low);
  assert.equal(orLogic(LogicValue.Low, LogicValue.High), LogicValue.High);
  assert.equal(orLogic(LogicValue.High, LogicValue.Low), LogicValue.High);
  assert.equal(orLogic(LogicValue.High, LogicValue.High), LogicValue.High);
  assert.equal(orLogic(LogicValue.Low, LogicValue.Undefined), LogicValue.Undefined);
  assert.equal(orLogic(LogicValue.High, LogicValue.Undefined), LogicValue.High); // Dominant high
});

test('TTL IC Definitions: 7404, 7408, 7432 Pinout Specifications', () => {
  // 7404
  const ic7404 = IC_DEFINITIONS['7404'];
  assert.ok(ic7404);
  assert.equal(ic7404.gates.length, 6);
  assert.equal(ic7404.vccPin, 14);
  assert.equal(ic7404.gndPin, 7);
  assert.equal(ic7404.signalAtPin(1), '1A');
  assert.equal(ic7404.signalAtPin(2), '1Y');

  // 7408
  const ic7408 = IC_DEFINITIONS['7408'];
  assert.ok(ic7408);
  assert.equal(ic7408.gates.length, 4);
  assert.equal(ic7408.vccPin, 14);
  assert.equal(ic7408.gndPin, 7);
  assert.equal(ic7408.signalAtPin(1), '1A');
  assert.equal(ic7408.signalAtPin(2), '1B');
  assert.equal(ic7408.signalAtPin(3), '1Y');

  // 7432
  const ic7432 = IC_DEFINITIONS['7432'];
  assert.ok(ic7432);
  assert.equal(ic7432.gates.length, 4);
  assert.equal(ic7432.vccPin, 14);
  assert.equal(ic7432.gndPin, 7);
});

test('BooleanExpression: Tokenization, Parsing, and AST Evaluation', () => {
  // Valid XOR SOP
  const expr = BooleanExpression.parse("A'B + AB'");
  assert.ok(expr.isValid);
  assert.deepEqual(expr.variables(), ['A', 'B']);

  // Truth table evaluations (00->0, 01->1, 10->1, 11->0)
  assert.equal(expr.evaluate({ A: false, B: false }), false);
  assert.equal(expr.evaluate({ A: false, B: true }), true);
  assert.equal(expr.evaluate({ A: true, B: false }), true);
  assert.equal(expr.evaluate({ A: true, B: true }), false);

  // Truth Table ordering MSB-first
  const table = expr.generateTruthTable();
  assert.equal(table.rows.length, 4);
  assert.equal(table.rows[0].binary, '00');
  assert.equal(table.rows[1].binary, '01');
  assert.equal(table.rows[2].binary, '10');
  assert.equal(table.rows[3].binary, '11');

  // Canonical representations
  assert.equal(expr.toCanonicalSop(), "A'B + AB'");
  assert.equal(expr.toCanonicalPos(), "(A + B)(A' + B')");
});

test('BooleanExpression: Error Handling for Malformed Expressions', () => {
  const empty = BooleanExpression.parse('');
  assert.equal(empty.isValid, false);
  assert.ok(empty.parseError);

  const unbalanced = BooleanExpression.parse('(A + B');
  assert.equal(unbalanced.isValid, false);

  const trailingOp = BooleanExpression.parse('A + ');
  assert.equal(trailingOp.isValid, false);
});

test('Circuit Simulator: Fixpoint Solve and Power Isolation', () => {
  // Unpowered circuit
  const unpowered = simulateCircuit({
    powerOn: false,
    inputs: { A: LogicValue.High, B: LogicValue.Low },
    chips: [
      { id: 'IC1', partNumber: '7408', vccConnected: false, gndConnected: false }
    ],
    wires: [
      { from: 'input:A', to: 'chip:IC1:1A' },
      { from: 'input:B', to: 'chip:IC1:1B' },
      { from: 'chip:IC1:1Y', to: 'output:LED' }
    ]
  });
  assert.equal(unpowered.status, 'NotPowered');
  assert.equal(unpowered.outputLed, LogicValue.Undefined);

  // Powered AND gate circuit
  const poweredAnd = simulateCircuit({
    powerOn: true,
    inputs: { A: LogicValue.High, B: LogicValue.High },
    chips: [
      { id: 'IC1', partNumber: '7408', vccConnected: true, gndConnected: true }
    ],
    wires: [
      { from: 'input:A', to: 'chip:IC1:1A' },
      { from: 'input:B', to: 'chip:IC1:1B' },
      { from: 'chip:IC1:1Y', to: 'output:LED' }
    ]
  });
  assert.equal(poweredAnd.status, 'Converged');
  assert.equal(poweredAnd.outputLed, LogicValue.High);

  // Change input B to Low -> LED should become Low
  const poweredAndLow = simulateCircuit({
    powerOn: true,
    inputs: { A: LogicValue.High, B: LogicValue.Low },
    chips: [
      { id: 'IC1', partNumber: '7408', vccConnected: true, gndConnected: true }
    ],
    wires: [
      { from: 'input:A', to: 'chip:IC1:1A' },
      { from: 'input:B', to: 'chip:IC1:1B' },
      { from: 'chip:IC1:1Y', to: 'output:LED' }
    ]
  });
  assert.equal(poweredAndLow.outputLed, LogicValue.Low);
});
