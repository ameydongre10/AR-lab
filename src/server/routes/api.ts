import { Router, Request, Response } from 'express';
import { DatabaseStore } from '../db/store.ts';
import { BooleanExpression } from '../../shared/booleanExpression.ts';
import { simulateCircuit, type CircuitNetlist } from '../../shared/circuitSimulator.ts';
import { z } from 'zod';

export const apiRouter = Router();
const db = DatabaseStore.getInstance();

// Validation schemas
const createExperimentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  targetExpression: z.string().min(1, 'Target expression is required'),
  canonicalForm: z.enum(['SOP', 'POS', 'General']).default('SOP'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  requiredIcs: z.array(z.enum(['7404', '7408', '7432'])).min(1, 'At least one IC is required'),
  defaultInputs: z.array(z.string()).default(['A', 'B']),
  modelAssetId: z.string().min(1, '3D Model asset is required'),
  instructions: z.array(z.object({
    step: z.number(),
    title: z.string(),
    details: z.string(),
    wiringTips: z.string().optional()
  })).optional()
});

// ==========================================
// SYSTEM & STATS
// ==========================================

apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    platform: 'Web & Mobile AR Lab Platform'
  });
});

apiRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SIMULATION & EXPRESSION TOOLS
// ==========================================

apiRouter.post('/validate-expression', (req: Request, res: Response) => {
  const { expression, customVars } = req.body;
  if (!expression || typeof expression !== 'string') {
    return res.status(400).json({ error: 'Expression string is required.' });
  }

  const parsed = BooleanExpression.parse(expression);
  if (!parsed.isValid) {
    return res.status(422).json({
      isValid: false,
      error: parsed.parseError || 'Invalid boolean expression syntax.'
    });
  }

  const truthTable = parsed.generateTruthTable(customVars);
  const sop = parsed.toCanonicalSop();
  const pos = parsed.toCanonicalPos();

  res.json({
    isValid: true,
    variables: parsed.variables(),
    canonicalSop: sop,
    canonicalPos: pos,
    truthTable
  });
});

apiRouter.post('/simulate', (req: Request, res: Response) => {
  const netlist: CircuitNetlist = req.body;
  if (!netlist || typeof netlist.powerOn !== 'boolean') {
    return res.status(400).json({ error: 'Valid circuit netlist object required.' });
  }

  try {
    const result = simulateCircuit(netlist);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: `Simulation failed: ${err.message}` });
  }
});

// ==========================================
// EXPERIMENTS CRUD
// ==========================================

apiRouter.get('/experiments', async (req: Request, res: Response) => {
  try {
    const { search, categoryId, difficulty, canonicalForm, page, limit, sortBy, sortOrder } = req.query;
    const result = await db.getExperiments({
      search: search as string,
      categoryId: categoryId as string,
      difficulty: difficulty as string,
      canonicalForm: canonicalForm as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/experiments/:id', async (req: Request, res: Response) => {
  try {
    const experiment = await db.getExperimentById(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    res.json(experiment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/experiments', async (req: Request, res: Response) => {
  try {
    const parsedBody = createExperimentSchema.parse(req.body);

    // Verify expression and calculate canonical truth table
    const expr = BooleanExpression.parse(parsedBody.targetExpression);
    if (!expr.isValid) {
      return res.status(422).json({ error: `Target expression invalid: ${expr.parseError}` });
    }

    const truthTableTarget = expr.generateTruthTable(parsedBody.defaultInputs);

    const created = await db.createExperiment({
      ...parsedBody,
      instructions: parsedBody.instructions || [
        {
          step: 1,
          title: 'Circuit Setup',
          details: 'Seat the required IC chips onto the breadboard.'
        }
      ],
      truthTableTarget,
      isPublished: true
    });

    res.status(201).json(created);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.issues });
    }
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/experiments/:id', async (req: Request, res: Response) => {
  try {
    const existing = await db.getExperimentById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    let truthTableTarget = existing.truthTableTarget;
    if (req.body.targetExpression && req.body.targetExpression !== existing.targetExpression) {
      const expr = BooleanExpression.parse(req.body.targetExpression);
      if (!expr.isValid) {
        return res.status(422).json({ error: `Target expression invalid: ${expr.parseError}` });
      }
      truthTableTarget = expr.generateTruthTable(req.body.defaultInputs || existing.defaultInputs);
    }

    const updated = await db.updateExperiment(req.params.id, {
      ...req.body,
      truthTableTarget
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/experiments/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.deleteExperiment(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    res.json({ message: 'Experiment deleted successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3D MODELS CRUD
// ==========================================

apiRouter.get('/models', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const models = await db.getModels(search);
    res.json(models);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/models/:id', async (req: Request, res: Response) => {
  try {
    const model = await db.getModelById(req.params.id);
    if (!model) return res.status(404).json({ error: 'Model not found' });
    res.json(model);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/models', async (req: Request, res: Response) => {
  try {
    const { name, description, format, fileUrl, posterUrl, polyCount, scale, arPlacement, dimensions } = req.body;
    if (!name || !fileUrl) {
      return res.status(400).json({ error: 'Name and fileUrl are required.' });
    }

    const created = await db.createModel({
      name,
      description: description || '',
      format: format || 'glb',
      fileUrl,
      posterUrl: posterUrl || '/posters/default.png',
      polyCount: polyCount || 500,
      scale: scale || 1.0,
      arPlacement: arPlacement || 'table',
      dimensions: dimensions || { width: 0.2, height: 0.1, depth: 0.2 }
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/models/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateModel(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Model not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/models/:id', async (req: Request, res: Response) => {
  try {
    const result = await db.deleteModel(req.params.id);
    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }
    res.json({ message: 'Model deleted successfully', id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CATEGORIES CRUD
// ==========================================

apiRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = await db.createCategory({
      name,
      slug,
      description: description || '',
      icon: icon || 'Cpu',
      color: color || 'cyan'
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const result = await db.deleteCategory(req.params.id);
    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// LAB SESSIONS CRUD
// ==========================================

apiRouter.get('/sessions', async (req: Request, res: Response) => {
  try {
    const experimentId = req.query.experimentId as string;
    const sessions = await db.getSessions(experimentId);
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { experimentId, studentName, netlistState, truthTableResults, notes } = req.body;
    if (!experimentId || !studentName) {
      return res.status(400).json({ error: 'experimentId and studentName are required' });
    }

    const exp = await db.getExperimentById(experimentId);
    if (!exp) return res.status(404).json({ error: 'Experiment not found' });

    // Calculate pass rate from results
    const results = truthTableResults || [];
    const passedCount = results.filter((r: any) => r.passed).length;
    const passRate = results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0;
    const isVerified = passRate === 100;

    const created = await db.createSession({
      experimentId,
      studentName,
      netlistState: netlistState || {},
      truthTableResults: results,
      passRate,
      isVerified,
      notes: notes || ''
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const success = await db.deleteSession(req.params.id);
    if (!success) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
