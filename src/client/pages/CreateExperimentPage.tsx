import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Category, ModelAsset } from '../types/index.ts';
import { ArrowLeft, Save, Sparkles, CheckCircle2, AlertCircle, Plus, Trash2, Cpu } from 'lucide-react';

interface CreateExperimentPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CreateExperimentPage: React.FC<CreateExperimentPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [models, setModels] = useState<ModelAsset[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetExpression, setTargetExpression] = useState("A'B + AB'");
  const [canonicalForm, setCanonicalForm] = useState<'SOP' | 'POS' | 'General'>('SOP');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [requiredIcs, setRequiredIcs] = useState<('7404' | '7408' | '7432')[]>(['7404', '7408', '7432']);
  const [modelAssetId, setModelAssetId] = useState('');
  const [instructions, setInstructions] = useState([
    { step: 1, title: 'Seat IC Chips', details: 'Seat the required 7400-series ICs across the breadboard center trough.', wiringTips: 'Orient Pin 1 notch to the left.' },
    { step: 2, title: 'Connect DC Power', details: 'Wire Pin 14 to +5V (VCC) and Pin 7 to GND on all ICs.', wiringTips: 'Double-check split power rail continuity.' },
    { step: 3, title: 'Wire Logic Gates', details: 'Connect input variables to the respective gate inputs.', wiringTips: 'Refer to DIP pinout diagrams.' },
    { step: 4, title: 'Connect Output Indicator', details: 'Route the final gate output to the Logic LED.', wiringTips: 'Ensure LED cathode is tied to GND.' }
  ]);

  const [expressionValidation, setExpressionValidation] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getModels()])
      .then(([catRes, modRes]) => {
        setCategories(catRes);
        setModels(modRes);
        if (catRes.length > 0) setCategoryId(catRes[0].id);
        if (modRes.length > 0) setModelAssetId(modRes[0].id);
      })
      .catch(err => console.error('Failed to load form dependencies:', err));
  }, []);

  // Live validate target boolean expression
  useEffect(() => {
    if (!targetExpression.trim()) {
      setExpressionValidation(null);
      return;
    }

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
      { step: prev.length + 1, title: 'New Procedure Step', details: '', wiringTips: '' }
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    setInstructions(prev => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !description.trim() || !categoryId || !modelAssetId) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (requiredIcs.length === 0) {
      setErrorMsg('Please select at least one required IC package.');
      return;
    }

    if (expressionValidation && !expressionValidation.isValid) {
      setErrorMsg('Please enter a syntactically valid Boolean expression.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createExperiment({
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

      onNavigate('experiment', created.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save experiment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('catalog')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <h1 className="text-xl font-bold text-white tracking-tight">Create New AR Experiment</h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Activity Overview</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Experiment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Implementation of Boolean Function F = A'B + AB' in SOP Form"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description & Educational Goals *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the theoretical context, laboratory goals, and circuit verification criteria..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Curriculum Category *</label>
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

        {/* Expression & Live Truth Table Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
              Boolean Expression & Automated Truth Table
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              Notation: A'B (AND), A+B (OR), !A or A' (NOT)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Boolean Expression *</label>
            <input
              type="text"
              required
              value={targetExpression}
              onChange={e => setTargetExpression(e.target.value)}
              placeholder="e.g. A'B + AB' or (A+B)(A'+B')"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 font-mono text-sm text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Live Validation Result */}
          {expressionValidation && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              {expressionValidation.isValid ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid Grammar Detected • Variables: {expressionValidation.variables.join(', ')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Canonical SOP Form:</span>
                      <span className="text-cyan-300 font-bold">{expressionValidation.canonicalSop}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Canonical POS Form:</span>
                      <span className="text-cyan-300 font-bold">{expressionValidation.canonicalPos}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Parse Error: {expressionValidation.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hardware & 3D Asset Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Components & 3D Model Asset</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Required TTL 7400-Series ICs *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: '7404' as const, name: 'SN7404 Hex Inverter', desc: 'Six independent NOT gates' },
                { id: '7408' as const, name: 'SN7408 Quad 2-Input AND', desc: 'Four 2-input AND gates' },
                { id: '7432' as const, name: 'SN7432 Quad 2-Input OR', desc: 'Four 2-input OR gates' }
              ].map(ic => {
                const isChecked = requiredIcs.includes(ic.id);
                return (
                  <div
                    key={ic.id}
                    onClick={() => handleToggleIc(ic.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold font-mono text-xs">{ic.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{ic.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">3D Spatial AR Model *</label>
            <select
              value={modelAssetId}
              onChange={e => setModelAssetId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.format.toUpperCase()} • {m.polyCount} polys)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step-by-Step Instructions Builder */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400">Wiring Procedure Instructions</h2>
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step</span>
            </button>
          </div>

          <div className="space-y-4">
            {instructions.map((step, idx) => (
              <div key={idx} className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">Step {step.step}</span>
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      value={step.title}
                      onChange={e => {
                        const copy = [...instructions];
                        copy[idx].title = e.target.value;
                        setInstructions(copy);
                      }}
                      placeholder="Step Title"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={step.wiringTips}
                      onChange={e => {
                        const copy = [...instructions];
                        copy[idx].wiringTips = e.target.value;
                        setInstructions(copy);
                      }}
                      placeholder="Wiring Tip (optional)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={step.details}
                  onChange={e => {
                    const copy = [...instructions];
                    copy[idx].details = e.target.value;
                    setInstructions(copy);
                  }}
                  placeholder="Detailed student instructions for this step..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-cyan-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Experiment...' : 'Publish Experiment to Database'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
