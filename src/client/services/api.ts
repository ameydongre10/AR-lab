import { Experiment, ModelAsset, Category, LabSession, StatsResponse, ValidateExpressionResponse } from '../types/index.ts';
import { FALLBACK_EXPERIMENTS, FALLBACK_MODELS, FALLBACK_CATEGORIES } from './fallbackData.ts';
import { BooleanExpression } from '../../shared/booleanExpression.ts';

const BASE_URL = '/api';

const STORAGE_KEYS = {
  EXPERIMENTS: 'ar_lab_experiments_v2',
  MODELS: 'ar_lab_models_v2',
  CATEGORIES: 'ar_lab_categories_v2',
  SESSIONS: 'ar_lab_sessions_v2'
};

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
  }
  return defaultValue;
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

export const api = {
  // Stats
  getStats: async (): Promise<StatsResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    const exps = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);
    const mods = getLocal<ModelAsset[]>(STORAGE_KEYS.MODELS, FALLBACK_MODELS);
    const cats = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, FALLBACK_CATEGORIES);
    const sess = getLocal<(LabSession & { experimentTitle?: string })[]>(STORAGE_KEYS.SESSIONS, []);

    const verifiedCount = sess.filter(s => s.isVerified).length;
    const avgPass = sess.length > 0
      ? Math.round(sess.reduce((acc, s) => acc + (s.passRate || 0), 0) / sess.length)
      : 100;

    return {
      totalExperiments: exps.length,
      totalModels: mods.length,
      totalCategories: cats.length,
      totalSessions: sess.length,
      verifiedSessions: verifiedCount,
      averagePassRate: avgPass,
      recentSessions: sess.slice(0, 5)
    };
  },

  // Health
  getHealth: async () => {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }
    return {
      status: 'healthy (client runtime)',
      uptime: 0,
      version: '2.0.0',
      platform: 'GitHub Pages & Static WebXR Engine'
    };
  },

  // Experiments CRUD
  getExperiments: async (params?: {
    search?: string;
    categoryId?: string;
    difficulty?: string;
    canonicalForm?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ items: (Experiment & { category?: Category; model?: ModelAsset })[]; total: number; page: number; limit: number; totalPages: number }> => {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.categoryId) query.append('categoryId', params.categoryId);
      if (params?.difficulty) query.append('difficulty', params.difficulty);
      if (params?.canonicalForm) query.append('canonicalForm', params.canonicalForm);
      if (params?.page) query.append('page', params.page.toString());
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.sortBy) query.append('sortBy', params.sortBy);
      if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

      const res = await fetch(`${BASE_URL}/experiments?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    let items = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);

    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter(e => e.title.toLowerCase().includes(q) || e.targetExpression.toLowerCase().includes(q));
    }
    if (params?.categoryId) {
      items = items.filter(e => e.categoryId === params.categoryId);
    }
    if (params?.canonicalForm) {
      items = items.filter(e => e.canonicalForm === params.canonicalForm);
    }
    if (params?.difficulty) {
      items = items.filter(e => e.difficulty.toLowerCase() === params.difficulty?.toLowerCase());
    }

    const total = items.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  getExperiment: async (id: string): Promise<Experiment & { category?: Category; model?: ModelAsset }> => {
    try {
      const res = await fetch(`${BASE_URL}/experiments/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    const exps = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);
    const found = exps.find(e => e.id === id) || exps[0];
    return found;
  },

  createExperiment: async (data: Partial<Experiment>): Promise<Experiment> => {
    try {
      const res = await fetch(`${BASE_URL}/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    // Client-side execution & persistence
    const expr = BooleanExpression.parse(data.targetExpression || "A'B + AB'");
    const truthTableTarget = expr.generateTruthTable(data.defaultInputs || ['A', 'B']);

    const newExp: Experiment & { category?: Category; model?: ModelAsset } = {
      id: `exp-${Date.now().toString(36)}`,
      title: data.title || 'Untitled Experiment',
      description: data.description || '',
      categoryId: data.categoryId || 'cat-canonical',
      targetExpression: data.targetExpression || "A'B + AB'",
      canonicalForm: data.canonicalForm || 'SOP',
      difficulty: data.difficulty || 'Beginner',
      requiredIcs: data.requiredIcs || ['7404', '7408', '7432'],
      defaultInputs: data.defaultInputs || ['A', 'B'],
      instructions: data.instructions || [
        { step: 1, title: 'Seat IC Chips', details: 'Seat the DIP packages across the center trough.' }
      ],
      modelAssetId: data.modelAssetId || 'mod-ar-station',
      truthTableTarget,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const exps = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);
    exps.unshift(newExp);
    setLocal(STORAGE_KEYS.EXPERIMENTS, exps);

    return newExp;
  },

  updateExperiment: async (id: string, data: Partial<Experiment>): Promise<Experiment> => {
    try {
      const res = await fetch(`${BASE_URL}/experiments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    const exps = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);
    const idx = exps.findIndex(e => e.id === id);
    if (idx !== -1) {
      exps[idx] = {
        ...exps[idx],
        ...data,
        updatedAt: new Date().toISOString()
      };
      setLocal(STORAGE_KEYS.EXPERIMENTS, exps);
      return exps[idx];
    }
    throw new Error('Experiment not found');
  },

  deleteExperiment: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/experiments/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {
      // Static fallback
    }

    let exps = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);
    exps = exps.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EXPERIMENTS, exps);
  },

  // 3D Models CRUD
  getModels: async (search?: string): Promise<ModelAsset[]> => {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`${BASE_URL}/models${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    let mods = getLocal<ModelAsset[]>(STORAGE_KEYS.MODELS, FALLBACK_MODELS);
    if (search) {
      const q = search.toLowerCase();
      mods = mods.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return mods;
  },

  getModel: async (id: string): Promise<ModelAsset> => {
    try {
      const res = await fetch(`${BASE_URL}/models/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    const mods = getLocal<ModelAsset[]>(STORAGE_KEYS.MODELS, FALLBACK_MODELS);
    return mods.find(m => m.id === id) || mods[0];
  },

  createModel: async (data: Partial<ModelAsset>): Promise<ModelAsset> => {
    try {
      const res = await fetch(`${BASE_URL}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    const newMod: ModelAsset = {
      id: `mod-${Date.now().toString(36)}`,
      name: data.name || 'New 3D Model',
      description: data.description || '',
      format: data.format || 'glb',
      fileUrl: data.fileUrl || '/models/breadboard.glb',
      posterUrl: data.posterUrl || '/posters/default.png',
      polyCount: data.polyCount || 500,
      scale: data.scale || 1.0,
      arPlacement: data.arPlacement || 'table',
      dimensions: data.dimensions || { width: 0.2, height: 0.1, depth: 0.2 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mods = getLocal<ModelAsset[]>(STORAGE_KEYS.MODELS, FALLBACK_MODELS);
    mods.push(newMod);
    setLocal(STORAGE_KEYS.MODELS, mods);
    return newMod;
  },

  deleteModel: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/models/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {
      // Static fallback
    }

    let mods = getLocal<ModelAsset[]>(STORAGE_KEYS.MODELS, FALLBACK_MODELS);
    mods = mods.filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MODELS, mods);
  },

  // Categories
  getCategories: async (): Promise<(Category & { experimentCount: number })[]> => {
    try {
      const res = await fetch(`${BASE_URL}/categories`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }
    return getLocal<(Category & { experimentCount: number })[]>(STORAGE_KEYS.CATEGORIES, FALLBACK_CATEGORIES);
  },

  // Sessions CRUD
  getSessions: async (experimentId?: string): Promise<(LabSession & { experimentTitle?: string })[]> => {
    try {
      const query = experimentId ? `?experimentId=${encodeURIComponent(experimentId)}` : '';
      const res = await fetch(`${BASE_URL}/sessions${query}`);
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    let list = getLocal<(LabSession & { experimentTitle?: string })[]>(STORAGE_KEYS.SESSIONS, []);
    if (experimentId) {
      list = list.filter(s => s.experimentId === experimentId);
    }
    return list;
  },

  createSession: async (data: Partial<LabSession>): Promise<LabSession> => {
    try {
      const res = await fetch(`${BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    const exps = getLocal<(Experiment & { category?: Category; model?: ModelAsset })[]>(STORAGE_KEYS.EXPERIMENTS, FALLBACK_EXPERIMENTS);
    const exp = exps.find(e => e.id === data.experimentId);

    const newSession: LabSession & { experimentTitle?: string } = {
      id: `sess-${Date.now().toString(36)}`,
      experimentId: data.experimentId || 'exp-xor-sop',
      experimentTitle: exp ? exp.title : 'Digital Logic Experiment',
      studentName: data.studentName || 'Lab Student',
      netlistState: data.netlistState || {},
      truthTableResults: data.truthTableResults || [],
      passRate: data.passRate || 100,
      isVerified: (data.passRate || 100) === 100,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const sessions = getLocal<(LabSession & { experimentTitle?: string })[]>(STORAGE_KEYS.SESSIONS, []);
    sessions.unshift(newSession);
    setLocal(STORAGE_KEYS.SESSIONS, sessions);

    return newSession;
  },

  deleteSession: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) return;
    } catch {
      // Static fallback
    }

    let sessions = getLocal<(LabSession & { experimentTitle?: string })[]>(STORAGE_KEYS.SESSIONS, []);
    sessions = sessions.filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SESSIONS, sessions);
  },

  // Expression validation
  validateExpression: async (expression: string, customVars?: string[]): Promise<ValidateExpressionResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/validate-expression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression, customVars })
      });
      if (res.ok) return await res.json();
    } catch {
      // Static fallback
    }

    // Direct browser calculation via TypeScript parser
    const parsed = BooleanExpression.parse(expression);
    if (!parsed.isValid) {
      throw new Error(parsed.parseError || 'Invalid boolean expression syntax.');
    }

    return {
      isValid: true,
      variables: parsed.variables(),
      canonicalSop: parsed.toCanonicalSop(),
      canonicalPos: parsed.toCanonicalPos(),
      truthTable: parsed.generateTruthTable(customVars)
    };
  }
};
