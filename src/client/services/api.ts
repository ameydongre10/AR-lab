import { Experiment, ModelAsset, Category, LabSession, StatsResponse, ValidateExpressionResponse } from '../types/index.ts';

const BASE_URL = '/api';

export const api = {
  // Stats
  getStats: async (): Promise<StatsResponse> => {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Experiments
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
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  getExperiment: async (id: string): Promise<Experiment & { category?: Category; model?: ModelAsset }> => {
    const res = await fetch(`${BASE_URL}/experiments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch experiment');
    return res.json();
  },

  createExperiment: async (data: Partial<Experiment>): Promise<Experiment> => {
    const res = await fetch(`${BASE_URL}/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create experiment');
    }
    return res.json();
  },

  updateExperiment: async (id: string, data: Partial<Experiment>): Promise<Experiment> => {
    const res = await fetch(`${BASE_URL}/experiments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update experiment');
    }
    return res.json();
  },

  deleteExperiment: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/experiments/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete experiment');
  },

  // 3D Models
  getModels: async (search?: string): Promise<ModelAsset[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`${BASE_URL}/models${query}`);
    if (!res.ok) throw new Error('Failed to fetch 3D models');
    return res.json();
  },

  getModel: async (id: string): Promise<ModelAsset> => {
    const res = await fetch(`${BASE_URL}/models/${id}`);
    if (!res.ok) throw new Error('Failed to fetch 3D model');
    return res.json();
  },

  createModel: async (data: Partial<ModelAsset>): Promise<ModelAsset> => {
    const res = await fetch(`${BASE_URL}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create 3D model');
    }
    return res.json();
  },

  updateModel: async (id: string, data: Partial<ModelAsset>): Promise<ModelAsset> => {
    const res = await fetch(`${BASE_URL}/models/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update 3D model');
    return res.json();
  },

  deleteModel: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/models/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete 3D model');
    }
  },

  // Categories
  getCategories: async (): Promise<(Category & { experimentCount: number })[]> => {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Sessions
  getSessions: async (experimentId?: string): Promise<(LabSession & { experimentTitle?: string })[]> => {
    const query = experimentId ? `?experimentId=${encodeURIComponent(experimentId)}` : '';
    const res = await fetch(`${BASE_URL}/sessions${query}`);
    if (!res.ok) throw new Error('Failed to fetch lab sessions');
    return res.json();
  },

  createSession: async (data: Partial<LabSession>): Promise<LabSession> => {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record lab session');
    return res.json();
  },

  deleteSession: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/sessions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lab session');
  },

  // Expression validation
  validateExpression: async (expression: string, customVars?: string[]): Promise<ValidateExpressionResponse> => {
    const res = await fetch(`${BASE_URL}/validate-expression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, customVars })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Expression validation failed');
    }
    return res.json();
  }
};
