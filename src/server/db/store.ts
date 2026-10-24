import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DatabaseSchema, Experiment, ModelAsset, Category, LabSession } from './schema.ts';
import { getInitialSeedData } from './seed.ts';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel
  ? path.join('/tmp', 'ar-lab-data')
  : path.resolve(__dirname, '../../../data');
const DB_FILE = path.join(DATA_DIR, 'ar-lab-db.json');
const BUNDLED_DB_FILE = path.resolve(__dirname, '../../../data/ar-lab-db.json');

export class DatabaseStore {
  private static instance: DatabaseStore;
  private data: DatabaseSchema;
  private isWriting: boolean = false;

  private constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
  }

  public static getInstance(): DatabaseStore {
    if (!DatabaseStore.instance) {
      DatabaseStore.instance = new DatabaseStore();
    }
    return DatabaseStore.instance;
  }

  private ensureDataDirectory() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Could not create data directory:', err);
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      if (isVercel && fs.existsSync(BUNDLED_DB_FILE)) {
        const raw = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.persistSync(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse existing DB file, re-seeding default database:', err);
    }

    const seed = getInitialSeedData();
    try {
      this.persistSync(seed);
    } catch (err) {
      console.warn('Could not persist seed data to disk, running with in-memory state:', err);
    }
    return seed;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.warn('Sync write error (in-memory fallback active):', err);
    }
  }

  public async persist(): Promise<void> {
    if (this.isWriting) return;
    this.isWriting = true;
    try {
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      await fs.promises.rename(tempFile, DB_FILE);
    } catch (err) {
      console.warn('Disk persist warning (in-memory state active):', err);
    } finally {
      this.isWriting = false;
    }
  }

  // ==========================================
  // EXPERIMENTS CRUD
  // ==========================================

  public async getExperiments(options?: {
    search?: string;
    categoryId?: string;
    difficulty?: string;
    canonicalForm?: string;
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'createdAt' | 'difficulty';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    items: (Experiment & { category?: Category; model?: ModelAsset })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let items = [...this.data.experiments];

    if (options?.search) {
      const q = options.search.toLowerCase();
      items = items.filter(
        e =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.targetExpression.toLowerCase().includes(q)
      );
    }

    if (options?.categoryId) {
      items = items.filter(e => e.categoryId === options.categoryId);
    }

    if (options?.difficulty) {
      items = items.filter(e => e.difficulty.toLowerCase() === options.difficulty?.toLowerCase());
    }

    if (options?.canonicalForm) {
      items = items.filter(e => e.canonicalForm.toLowerCase() === options.canonicalForm?.toLowerCase());
    }

    const total = items.length;

    // Sorting
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';

    items.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'difficulty') cmp = a.difficulty.localeCompare(b.difficulty);
      else cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    // Pagination
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, Math.min(100, options?.limit || 20));
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    // Join relations
    const enriched = paginated.map(exp => ({
      ...exp,
      category: this.data.categories.find(c => c.id === exp.categoryId),
      model: this.data.models.find(m => m.id === exp.modelAssetId)
    }));

    return {
      items: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  public async getExperimentById(id: string): Promise<(Experiment & { category?: Category; model?: ModelAsset }) | null> {
    const exp = this.data.experiments.find(e => e.id === id);
    if (!exp) return null;
    return {
      ...exp,
      category: this.data.categories.find(c => c.id === exp.categoryId),
      model: this.data.models.find(m => m.id === exp.modelAssetId)
    };
  }

  public async createExperiment(input: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experiment> {
    const now = new Date().toISOString();
    const newExp: Experiment = {
      ...input,
      id: `exp-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.experiments.push(newExp);
    await this.persist();
    return newExp;
  }

  public async updateExperiment(id: string, input: Partial<Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Experiment | null> {
    const idx = this.data.experiments.findIndex(e => e.id === id);
    if (idx === -1) return null;

    const existing = this.data.experiments[idx];
    const updated: Experiment = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString()
    };

    this.data.experiments[idx] = updated;
    await this.persist();
    return updated;
  }

  public async deleteExperiment(id: string): Promise<boolean> {
    const initialLen = this.data.experiments.length;
    this.data.experiments = this.data.experiments.filter(e => e.id !== id);
    if (this.data.experiments.length === initialLen) return false;

    // Cascade delete associated lab sessions
    this.data.sessions = this.data.sessions.filter(s => s.experimentId !== id);

    await this.persist();
    return true;
  }

  // ==========================================
  // MODELS CRUD
  // ==========================================

  public async getModels(search?: string): Promise<ModelAsset[]> {
    if (!search) return [...this.data.models];
    const q = search.toLowerCase();
    return this.data.models.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }

  public async getModelById(id: string): Promise<ModelAsset | null> {
    return this.data.models.find(m => m.id === id) || null;
  }

  public async createModel(input: Omit<ModelAsset, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModelAsset> {
    const now = new Date().toISOString();
    const newModel: ModelAsset = {
      ...input,
      id: `mod-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.models.push(newModel);
    await this.persist();
    return newModel;
  }

  public async updateModel(id: string, input: Partial<Omit<ModelAsset, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ModelAsset | null> {
    const idx = this.data.models.findIndex(m => m.id === id);
    if (idx === -1) return null;

    const updated: ModelAsset = {
      ...this.data.models[idx],
      ...input,
      updatedAt: new Date().toISOString()
    };
    this.data.models[idx] = updated;
    await this.persist();
    return updated;
  }

  public async deleteModel(id: string): Promise<{ success: boolean; error?: string }> {
    const inUse = this.data.experiments.some(e => e.modelAssetId === id);
    if (inUse) {
      return { success: false, error: 'Cannot delete 3D model: it is currently referenced by one or more active experiments.' };
    }

    const initialLen = this.data.models.length;
    this.data.models = this.data.models.filter(m => m.id !== id);
    if (this.data.models.length === initialLen) return { success: false, error: 'Model not found.' };

    await this.persist();
    return { success: true };
  }

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================

  public async getCategories(): Promise<(Category & { experimentCount: number })[]> {
    return this.data.categories.map(cat => ({
      ...cat,
      experimentCount: this.data.experiments.filter(e => e.categoryId === cat.id).length
    }));
  }

  public async getCategoryById(id: string): Promise<Category | null> {
    return this.data.categories.find(c => c.id === id || c.slug === id) || null;
  }

  public async createCategory(input: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const now = new Date().toISOString();
    const newCat: Category = {
      ...input,
      id: `cat-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.categories.push(newCat);
    await this.persist();
    return newCat;
  }

  public async updateCategory(id: string, input: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Category | null> {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const updated: Category = {
      ...this.data.categories[idx],
      ...input,
      updatedAt: new Date().toISOString()
    };
    this.data.categories[idx] = updated;
    await this.persist();
    return updated;
  }

  public async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const inUse = this.data.experiments.some(e => e.categoryId === id);
    if (inUse) {
      return { success: false, error: 'Cannot delete category: it contains active experiments.' };
    }

    const initialLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    if (this.data.categories.length === initialLen) return { success: false, error: 'Category not found.' };

    await this.persist();
    return { success: true };
  }

  // ==========================================
  // LAB SESSIONS CRUD
  // ==========================================

  public async getSessions(experimentId?: string): Promise<(LabSession & { experimentTitle?: string })[]> {
    let list = [...this.data.sessions];
    if (experimentId) {
      list = list.filter(s => s.experimentId === experimentId);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list.map(sess => {
      const exp = this.data.experiments.find(e => e.id === sess.experimentId);
      return {
        ...sess,
        experimentTitle: exp ? exp.title : 'Deleted Experiment'
      };
    });
  }

  public async getSessionById(id: string): Promise<LabSession | null> {
    return this.data.sessions.find(s => s.id === id) || null;
  }

  public async createSession(input: Omit<LabSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<LabSession> {
    const now = new Date().toISOString();
    const newSession: LabSession = {
      ...input,
      id: `sess-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.sessions.unshift(newSession);
    await this.persist();
    return newSession;
  }

  public async deleteSession(id: string): Promise<boolean> {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter(s => s.id !== id);
    if (this.data.sessions.length === initialLen) return false;
    await this.persist();
    return true;
  }

  // ==========================================
  // AGGREGATE STATS
  // ==========================================

  public async getStats(): Promise<{
    totalExperiments: number;
    totalModels: number;
    totalCategories: number;
    totalSessions: number;
    verifiedSessions: number;
    averagePassRate: number;
    recentSessions: (LabSession & { experimentTitle?: string })[];
  }> {
    const totalSessions = this.data.sessions.length;
    const verifiedSessions = this.data.sessions.filter(s => s.isVerified).length;
    const sumPass = this.data.sessions.reduce((acc, s) => acc + (s.passRate || 0), 0);
    const averagePassRate = totalSessions > 0 ? Math.round(sumPass / totalSessions) : 100;

    const recentSessions = (await this.getSessions()).slice(0, 5);

    return {
      totalExperiments: this.data.experiments.length,
      totalModels: this.data.models.length,
      totalCategories: this.data.categories.length,
      totalSessions,
      verifiedSessions,
      averagePassRate,
      recentSessions
    };
  }
}
