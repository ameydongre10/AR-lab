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
      setErrorMsg('Please complete all required fields.');
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
      <div className="flex flex-col items-center justify-center min-h-[400px] font-mono">
        <div className="w-8 h-8 border-2 border-[#202535] border-t-emerald-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-[#717a94]">FETCHING MODULE FOR EDIT...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#202535]">
        <button
          onClick={() => onNavigate('experiment', experimentId)}
          className="btn-tactile flex items-center gap-2 text-xs text-[#8c96b0] hover:text-white bg-[#10121a] border border-[#222737] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CANCEL EDIT</span>
        </button>

        <h1 className="text-base font-bold text-white uppercase tracking-wider">
          MODIFY MODULE SPECIFICATION // ID: {experimentId.slice(0, 8)}
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#1e1515] border border-rose-500/40 rounded-lg flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Module Details */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-[#1f2231]">
            [ 01 // OVERVIEW & CURRICULUM CLASSIFICATION ]
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Experiment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Description & Educational Theory *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Canonical Form</label>
              <select
                value={canonicalForm}
                onChange={e => setCanonicalForm(e.target.value as any)}
                className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
              >
                <option value="SOP">SOP (Sum of Products)</option>
                <option value="POS">POS (Product of Sums)</option>
                <option value="General">General Form</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Difficulty Tier</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expression Validation */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2231]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              [ 02 // TARGET BOOLEAN EQUATION ]
            </h2>
            <span className="text-[10px] text-[#636c84]">LIVE AST PARSER</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Boolean Expression *</label>
            <input
              type="text"
              required
              value={targetExpression}
              onChange={e => setTargetExpression(e.target.value)}
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3.5 py-2 font-mono text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {expressionValidation && (
            <div className="p-3 bg-[#090b0f] border border-[#1e2332] rounded-lg space-y-2 text-xs">
              {expressionValidation.isValid ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SYNTAX VALID • VARIABLES: [{expressionValidation.variables.join(', ')}]</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>SYNTAX FAULT: {expressionValidation.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hardware & 3D Spatial Model */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-[#1f2231]">
            [ 03 // TTL HARDWARE CHIPS ]
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-2">Required IC Packages *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: '7404' as const, name: 'SN7404 Hex Inverter', desc: 'Six NOT inverters' },
                { id: '7408' as const, name: 'SN7408 Quad 2-In AND', desc: 'Four 2-input AND' },
                { id: '7432' as const, name: 'SN7432 Quad 2-In OR', desc: 'Four 2-input OR' }
              ].map(ic => {
                const isChecked = requiredIcs.includes(ic.id);
                return (
                  <div
                    key={ic.id}
                    onClick={() => handleToggleIc(ic.id)}
                    className={`btn-tactile p-3 rounded-lg border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-[#15241d] border-emerald-500/50 text-emerald-300'
                        : 'bg-[#090b0f] border-[#222737] text-[#6d768f] hover:border-[#333b50]'
                    }`}
                  >
                    <div className="font-bold text-xs">{ic.name}</div>
                    <div className="text-[10px] text-[#717a94] mt-0.5">{ic.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-tactile flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'PERSISTING CHANGES...' : 'UPDATE SPECIFICATION'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
