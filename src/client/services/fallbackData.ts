import { Experiment, ModelAsset, Category } from '../types/index.ts';

export const FALLBACK_CATEGORIES: (Category & { experimentCount: number })[] = [
  {
    id: 'cat-canonical',
    name: 'SOP & POS Normal Forms',
    slug: 'sop-pos-forms',
    description: 'Sum-of-Products and Product-of-Sums standard forms.',
    icon: 'Layers',
    color: 'emerald',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    experimentCount: 2
  },
  {
    id: 'cat-combinational',
    name: 'Combinational Logic',
    slug: 'combinational-logic',
    description: 'Fundamental gate circuits and theorems.',
    icon: 'Cpu',
    color: 'cyan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    experimentCount: 1
  },
  {
    id: 'cat-arithmetic',
    name: 'Arithmetic Circuits',
    slug: 'arithmetic-circuits',
    description: 'Binary adders and arithmetic units.',
    icon: 'Calculator',
    color: 'amber',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    experimentCount: 1
  },
  {
    id: 'cat-routing',
    name: 'Data Routing & Muxes',
    slug: 'data-routing',
    description: 'Multiplexers and decoders.',
    icon: 'GitBranch',
    color: 'purple',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    experimentCount: 1
  }
];

export const FALLBACK_MODELS: ModelAsset[] = [
  {
    id: 'mod-ar-station',
    name: 'AR Lab Workbench Rig',
    description: 'Complete spatial electronics laboratory bench with breadboard and chips.',
    format: 'glb',
    fileUrl: '/models/ar-lab-station.glb',
    posterUrl: '/posters/ar-station.png',
    polyCount: 1420,
    scale: 1.0,
    arPlacement: 'table',
    dimensions: { width: 0.56, height: 0.12, depth: 0.34 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mod-breadboard',
    name: 'Full-Size Solderless Breadboard',
    description: 'Standard 830-tie-point solderless breadboard.',
    format: 'glb',
    fileUrl: '/models/breadboard.glb',
    posterUrl: '/posters/breadboard.png',
    polyCount: 680,
    scale: 1.0,
    arPlacement: 'table',
    dimensions: { width: 0.42, height: 0.02, depth: 0.16 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mod-ic-7404',
    name: 'SN7404 Hex Inverter DIP-14',
    description: 'Six independent NOT gates.',
    format: 'glb',
    fileUrl: '/models/ic-7404.glb',
    posterUrl: '/posters/ic-7404.png',
    polyCount: 320,
    scale: 1.0,
    arPlacement: 'table',
    dimensions: { width: 0.19, height: 0.06, depth: 0.07 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mod-ic-7408',
    name: 'SN7408 Quad 2-Input AND Gate',
    description: 'Four 2-input AND gates.',
    format: 'glb',
    fileUrl: '/models/ic-7408.glb',
    posterUrl: '/posters/ic-7408.png',
    polyCount: 320,
    scale: 1.0,
    arPlacement: 'table',
    dimensions: { width: 0.19, height: 0.06, depth: 0.07 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mod-ic-7432',
    name: 'SN7432 Quad 2-Input OR Gate',
    description: 'Four 2-input OR gates.',
    format: 'glb',
    fileUrl: '/models/ic-7432.glb',
    posterUrl: '/posters/ic-7432.png',
    polyCount: 320,
    scale: 1.0,
    arPlacement: 'table',
    dimensions: { width: 0.19, height: 0.06, depth: 0.07 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const FALLBACK_EXPERIMENTS: (Experiment & { category?: Category; model?: ModelAsset })[] = [
  {
    id: 'exp-xor-sop',
    title: 'Boolean Function in SOP Form: F = A\'B + AB\'',
    description: 'Construct and verify a 2-input Exclusive-OR (XOR) logic circuit implemented strictly in canonical Sum-of-Products (SOP) form using TTL inverters, AND gates, and OR gates.',
    categoryId: 'cat-canonical',
    targetExpression: "A'B + AB'",
    canonicalForm: 'SOP',
    difficulty: 'Beginner',
    requiredIcs: ['7404', '7408', '7432'],
    defaultInputs: ['A', 'B'],
    instructions: [
      { step: 1, title: 'Place and Seat IC Packages', details: 'Seat the 7404, 7408, and 7432 across the breadboard center trough.', wiringTips: 'Orient Pin 1 notch left.' },
      { step: 2, title: 'Connect DC Power Rails', details: 'Wire Pin 14 of all three ICs to +5V VCC and Pin 7 to GND.', wiringTips: 'Split rail continuity.' },
      { step: 3, title: 'Form Min-Terms A\'B and AB\'', details: 'Invert input A using 7404. Connect inverted A and Input B to 7408 Gate 1.', wiringTips: 'Measure pin 3 and 6.' },
      { step: 4, title: 'Sum the Products', details: 'Feed outputs of Gate 1 and Gate 2 into 7432 OR Gate 1.', wiringTips: 'LED illuminates when A != B.' }
    ],
    modelAssetId: 'mod-ar-station',
    truthTableTarget: {
      variables: ['A', 'B'],
      rows: [
        { inputs: { A: false, B: false }, output: false, binary: '00' },
        { inputs: { A: false, B: true }, output: true, binary: '01' },
        { inputs: { A: true, B: false }, output: true, binary: '10' },
        { inputs: { A: true, B: true }, output: false, binary: '11' }
      ]
    },
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[0],
    model: FALLBACK_MODELS[0]
  },
  {
    id: 'exp-xor-pos',
    title: 'Boolean Function in POS Form: F = (A + B)(A\' + B\')',
    description: 'Implement the identical XOR truth table using canonical Product-of-Sums (POS) form and verify gate-level equivalence with the SOP implementation.',
    categoryId: 'cat-canonical',
    targetExpression: "(A+B)(A'+B')",
    canonicalForm: 'POS',
    difficulty: 'Intermediate',
    requiredIcs: ['7404', '7408', '7432'],
    defaultInputs: ['A', 'B'],
    instructions: [
      { step: 1, title: 'Form Max-Terms (A + B) and (A\' + B\')', details: 'Connect Input A and B to 7432 OR Gate 1. Invert both inputs using 7404, then connect to 7432 OR Gate 2.', wiringTips: 'Maxterms equal 0 on invalid parity.' },
      { step: 2, title: 'Multiply the Sums', details: 'Wire outputs of both OR gates into 7408 AND Gate 1.', wiringTips: 'Verify output agrees with SOP.' }
    ],
    modelAssetId: 'mod-ar-station',
    truthTableTarget: {
      variables: ['A', 'B'],
      rows: [
        { inputs: { A: false, B: false }, output: false, binary: '00' },
        { inputs: { A: false, B: true }, output: true, binary: '01' },
        { inputs: { A: true, B: false }, output: true, binary: '10' },
        { inputs: { A: true, B: true }, output: false, binary: '11' }
      ]
    },
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[0],
    model: FALLBACK_MODELS[0]
  },
  {
    id: 'exp-demorgan',
    title: "De Morgan's First Law: (A + B)' = A'B'",
    description: "Prove algebraically and experimentally that the NOR function (A+B)' is equivalent to the conjunction of complemented literals A'B'.",
    categoryId: 'cat-combinational',
    targetExpression: "A'B'",
    canonicalForm: 'SOP',
    difficulty: 'Beginner',
    requiredIcs: ['7404', '7408'],
    defaultInputs: ['A', 'B'],
    instructions: [
      { step: 1, title: 'Invert Primary Inputs', details: 'Route Input A through 7404 Gate 1 and Input B through 7404 Gate 2.', wiringTips: 'Pin 2 and Pin 4.' },
      { step: 2, title: 'Conjoin Inverted Signals', details: 'Wire Pin 2 and 4 into Pin 1 and 2 of 7408 AND gate.', wiringTips: 'HIGH only on 00.' }
    ],
    modelAssetId: 'mod-ic-7408',
    truthTableTarget: {
      variables: ['A', 'B'],
      rows: [
        { inputs: { A: false, B: false }, output: true, binary: '00' },
        { inputs: { A: false, B: true }, output: false, binary: '01' },
        { inputs: { A: true, B: false }, output: false, binary: '10' },
        { inputs: { A: true, B: true }, output: false, binary: '11' }
      ]
    },
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: FALLBACK_CATEGORIES[1],
    model: FALLBACK_MODELS[3]
  }
];
