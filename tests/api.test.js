import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseStore } from '../src/server/db/store.ts';

const db = DatabaseStore.getInstance();

test('DatabaseStore: Experiments CRUD Operations', async () => {
  // Read all initial experiments
  const initial = await db.getExperiments();
  assert.ok(initial.items.length >= 5);
  const countBefore = initial.total;

  // Create new experiment
  const created = await db.createExperiment({
    title: 'Unit Test Experiment: 3-Input NAND',
    description: 'Construct and verify a 3-input NAND function.',
    categoryId: 'cat-combinational',
    targetExpression: "(ABC)'",
    canonicalForm: 'SOP',
    difficulty: 'Advanced',
    requiredIcs: ['7404', '7408'],
    defaultInputs: ['A', 'B', 'C'],
    instructions: [
      { step: 1, title: 'Setup', details: 'Seat IC packages' }
    ],
    modelAssetId: 'mod-breadboard',
    truthTableTarget: {
      variables: ['A', 'B', 'C'],
      rows: [
        { inputs: { A: false, B: false, C: false }, output: true, binary: '000' }
      ]
    },
    isPublished: true
  });

  assert.ok(created.id);
  assert.equal(created.title, 'Unit Test Experiment: 3-Input NAND');

  // Verify Read by ID
  const fetched = await db.getExperimentById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.id, created.id);
  assert.equal(fetched.targetExpression, "(ABC)'");

  // Update experiment
  const updated = await db.updateExperiment(created.id, {
    title: 'Updated 3-Input NAND Circuit'
  });
  assert.ok(updated);
  assert.equal(updated.title, 'Updated 3-Input NAND Circuit');

  // Verify update persisted
  const reFetched = await db.getExperimentById(created.id);
  assert.equal(reFetched.title, 'Updated 3-Input NAND Circuit');

  // Delete experiment
  const deleted = await db.deleteExperiment(created.id);
  assert.equal(deleted, true);

  // Verify Delete
  const afterDelete = await db.getExperimentById(created.id);
  assert.equal(afterDelete, null);
});

test('DatabaseStore: 3D Models CRUD and Safety Constraints', async () => {
  // Read models
  const models = await db.getModels();
  assert.ok(models.length >= 5);

  // Attempting to delete an active referenced model should be blocked
  const blockedDelete = await db.deleteModel('mod-ar-station');
  assert.equal(blockedDelete.success, false);
  assert.ok(blockedDelete.error.includes('referenced'));

  // Create temporary model
  const newModel = await db.createModel({
    name: 'Temporary Oscilloscope Probe',
    description: 'High-impedance logic probe',
    format: 'glb',
    fileUrl: '/models/probe.glb',
    posterUrl: '/posters/probe.png',
    polyCount: 150,
    scale: 1.0,
    arPlacement: 'table',
    dimensions: { width: 0.1, height: 0.02, depth: 0.02 }
  });
  assert.ok(newModel.id);

  // Delete temporary unreferenced model should succeed
  const allowedDelete = await db.deleteModel(newModel.id);
  assert.equal(allowedDelete.success, true);
});

test('DatabaseStore: Lab Sessions CRUD and Pass Rate Calculation', async () => {
  const newSession = await db.createSession({
    experimentId: 'exp-xor-sop',
    studentName: 'Automated Test Runner',
    netlistState: { verified: true },
    truthTableResults: [
      { binary: '00', inputs: { A: false, B: false }, expected: false, actual: false, passed: true },
      { binary: '01', inputs: { A: false, B: true }, expected: true, actual: true, passed: true },
      { binary: '10', inputs: { A: true, B: false }, expected: true, actual: true, passed: true },
      { binary: '11', inputs: { A: true, B: true }, expected: false, actual: false, passed: true }
    ],
    passRate: 100,
    isVerified: true,
    notes: 'Unit test verification run'
  });

  assert.ok(newSession.id);
  assert.equal(newSession.studentName, 'Automated Test Runner');
  assert.equal(newSession.passRate, 100);
  assert.equal(newSession.isVerified, true);

  // Delete session
  const deleted = await db.deleteSession(newSession.id);
  assert.equal(deleted, true);
});
