/**
 * Database Types & Relational Schema for AR Lab
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModelAsset {
  id: string;
  name: string;
  description: string;
  format: 'glb' | 'gltf' | 'usdz';
  fileUrl: string;
  posterUrl: string;
  polyCount: number;
  scale: number;
  arPlacement: 'floor' | 'table';
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InstructionStep {
  step: number;
  title: string;
  details: string;
  wiringTips?: string;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  targetExpression: string;
  canonicalForm: 'SOP' | 'POS' | 'General';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  requiredIcs: ('7404' | '7408' | '7432')[];
  defaultInputs: string[];
  instructions: InstructionStep[];
  modelAssetId: string;
  truthTableTarget: {
    variables: string[];
    rows: {
      inputs: Record<string, boolean>;
      output: boolean;
      binary: string;
    }[];
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabSession {
  id: string;
  experimentId: string;
  studentName: string;
  netlistState: any;
  truthTableResults: {
    binary: string;
    inputs: Record<string, boolean>;
    expected: boolean;
    actual: boolean;
    passed: boolean;
  }[];
  passRate: number; // 0 to 100
  isVerified: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  categories: Category[];
  models: ModelAsset[];
  experiments: Experiment[];
  sessions: LabSession[];
}
