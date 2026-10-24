import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Structured request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Serve 3D models and static assets from public
const publicDir = path.resolve(__dirname, '../../public');
app.use(express.static(publicDir));
app.use('/models', express.static(path.join(publicDir, 'models'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.glb')) {
      res.setHeader('Content-Type', 'model/gltf-binary');
    }
  }
}));

// API Router (mount on both /api and root for Vercel serverless compatibility)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve built frontend files in production (only if not on Vercel serverless)
const clientBuildDir = path.resolve(__dirname, '../client');
if (!process.env.VERCEL) {
  app.use(express.static(clientBuildDir));

  // SPA fallback for frontend routes (only if not an API route)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.includes('.')) {
      const indexPath = path.join(clientBuildDir, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          res.status(200).send(`AR Lab API Server running. Open frontend on port 3000 in dev mode.`);
        }
      });
    } else {
      next();
    }
  });
}

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`Unhandled server error [${req.method} ${req.url}]:`, err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

// Only listen if not running in Vercel serverless environment or test mode
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  AR Lab Platform Server listening on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  API Root:     http://localhost:${PORT}/api`);
    console.log(`==================================================`);
  });
}

export default app;
