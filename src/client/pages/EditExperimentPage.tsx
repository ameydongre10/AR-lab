import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Category, ModelAsset, Experiment } from '../types/index.ts';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface EditExperimentPageProps {
  experimentId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const EditExperimentPage: React.FC<EditExperimentPageProps> = ({
  experimentId,
  onNavigate
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<ModelAsset[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetExpression, setTargetExpression] = useState('');
  const [canonicalForm, setCanonicalForm] = useState<'SOP' | 'POS' | 'General'>('SOP');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [requiredIcs, setRequiredIcs] = useState<('7404' | '7408' | '7432')[]>([]);
  const [modelAssetId, setModelAssetId] = useState('');
  const [instructions, setInstructions] = useState<any[]>([]);

  const [expressionValidation, setExpressionValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getModels(),
      api.getExperiment(experimentId)
    ])
      .then(([catRes, modRes, exp]) => {
        setCategories(catRes);
        setModels(modRes);
        setTitle(exp.title);
        setDescription(exp.description);
        setCategoryId(exp.categoryId);
        setTargetExpression(exp.targetExpression);
        setCanonicalForm(exp.canonicalForm);
        setDifficulty(exp.difficulty);
        setRequiredIcs(exp.requiredIcs);
        setModelAssetId(exp.modelAssetId);
        setInstructions(exp.instructions || []);
      })
      .catch(err => {
        console.error('Failed to load experiment for editing:', err);
        setErrorMsg('Failed to load experiment.');
      })
      .finally(() => setIsLoading(false));
  }, [experimentId]);

  useEffect(() => {
    if (!targetExpression.trim()) return;
    api.validateExpression(targetExpression)
      .then(res => setExpressionValidation(res))
      .catch(err => setExpressionValidation({ isValid: false, error: err.message }));
  }, [targetExpression]);

  const handleToggleIc = (ic: '7404' | '7408' | '7432') => {
    setRequiredIcs(prev =>
      prev.includes(ic) ? prev.filter(x => x !== ic) : [...prev, ic]
    );
  };

  const handleAddStep = () => {
    setInstructions(prev => [
      ...prev,
      { step: prev.length + 1, title: 'Next Procedure Step', details: '', wiringTips: '' }
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please fill in required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.updateExperiment(experimentId, {
        title,
        description,
        categoryId,
        targetExpression,
        canonicalForm,
        difficulty,
        requiredIcs,
        defaultInputs: expressionValidation?.variables || ['A', 'B'],
        modelAssetId,
        instructions
      });

      onNavigate('experiment', experimentId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update experiment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">Loading experiment data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('experiment', experimentId)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <h1 className="text-xl font-bold text-white tracking-tight">Edit Experiment</h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Activity Overview</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experiment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Canonical Form</label>
              <select
                value={canonicalForm}
                onChange={e => setCanonicalForm(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="SOP">SOP (Sum of Products)</option>
                <option value="POS">POS (Product of Sums)</option>
                <option value="General">General Form</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Target Expression</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Boolean Expression *</label>
            <input
              type="text"
              required
              value={targetExpression}
              onChange={e => setTargetExpression(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {expressionValidation && expressionValidation.isValid && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold p-3 bg-slate-950 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4" />
              <span>Variables: {expressionValidation.variables.join(', ')} • Canonical SOP: {expressionValidation.canonicalSop}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-cyan-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Changes...' : 'Save & Update Experiment'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
