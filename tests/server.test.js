import test from 'node:test';
import assert from 'node:assert/strict';
import { apiRouter } from '../src/server/routes/api.ts';

function mockRequestResponse(method, url, body = {}, query = {}) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      path: url,
      query,
      body,
      params: {},
      headers: {}
    };

    const res = {
      statusCode: 200,
      headers: {},
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.data = data;
        resolve(this);
      },
      send(data) {
        this.data = data;
        resolve(this);
      },
      setHeader(k, v) {
        this.headers[k] = v;
      }
    };

    // Find and execute route handler
    apiRouter.handle(req, res, () => {
      resolve(res);
    });
  });
}

test('API Router: Health & Diagnostics Route', async () => {
  const res = await mockRequestResponse('GET', '/health');
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, 'healthy');
  assert.equal(res.data.version, '2.0.0');
});

test('API Router: Validate Expression Endpoint', async () => {
  const res = await mockRequestResponse('POST', '/validate-expression', {
    expression: "A'B + AB'"
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.isValid, true);
  assert.deepEqual(res.data.variables, ['A', 'B']);
  assert.equal(res.data.canonicalSop, "A'B + AB'");
});

test('API Router: Circuit Simulation Route', async () => {
  const res = await mockRequestResponse('POST', '/simulate', {
    powerOn: true,
    inputs: { A: 1, B: 1 },
    chips: [
      { id: 'IC1', partNumber: '7408', vccConnected: true, gndConnected: true }
    ],
    wires: [
      { from: 'input:A', to: 'chip:IC1:1A' },
      { from: 'input:B', to: 'chip:IC1:1B' },
      { from: 'chip:IC1:1Y', to: 'output:LED' }
    ]
  });
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.status, 'Converged');
  assert.equal(res.data.outputLed, 1);
});
