import { Experiment, ModelAsset, Category, LabSession, InstructionStep } from '../../server/db/schema.ts';

export type { Experiment, ModelAsset, Category, LabSession, InstructionStep };

export interface StatsResponse {
  totalExperiments: number;
  totalModels: number;
  totalCategories: number;
  totalSessions: number;
  verifiedSessions: number;
  averagePassRate: number;
  recentSessions: (LabSession & { experimentTitle?: string })[];
}

export interface ValidateExpressionResponse {
  isValid: boolean;
  variables: string[];
  canonicalSop: string;
  canonicalPos: string;
  truthTable: {
    variables: string[];
    rows: {
      inputs: Record<string, boolean>;
      output: boolean;
      binary: string;
    }[];
  };
}
