import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Category, ModelAsset } from '../types/index.ts';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, Plus, Trash2, Cpu, Terminal, Compass } from 'lucide-react';

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
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (requiredIcs.length === 0) {
      setErrorMsg('Please specify at least one required TTL 7400 IC.');
      return;
    }

    if (expressionValidation && !expressionValidation.isValid) {
      setErrorMsg('Target Boolean expression is not valid syntax.');
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
    <div className="max-w-4xl mx-auto space-y-8 pb-16 font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#202535]">
        <button
          onClick={() => onNavigate('catalog')}
          className="btn-tactile flex items-center gap-2 text-xs text-[#8c96b0] hover:text-white bg-[#10121a] border border-[#222737] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>CANCEL & RETURN</span>
        </button>

        <h1 className="text-base font-bold text-white uppercase tracking-wider">
          AUTHOR NEW EXPERIMENT SPECIFICATION
        </h1>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#1e1515] border border-rose-500/40 rounded-lg flex items-center gap-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Module Metadata */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-[#1f2231]">
            [ 01 // EXPERIMENT IDENTIFIER & OBJECTIVES ]
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Experiment Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Implementation of Boolean Function F = A'B + AB' in SOP Form"
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#515970] focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Description & Theory *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain the theoretical context, laboratory goals, and circuit verification criteria..."
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3.5 py-2 text-xs text-white placeholder-[#515970] focus:outline-none focus:border-emerald-500 font-mono"
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

        {/* Expression & Live Truth Table Generator */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2231]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              [ 02 // BOOLEAN ALGEBRA EQUATION & PARSER ]
            </h2>
            <span className="text-[10px] text-[#636c84]">
              SYNTAX: A'B (AND), A+B (OR), A' (NOT)
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">Target Boolean Expression *</label>
            <input
              type="text"
              required
              value={targetExpression}
              onChange={e => setTargetExpression(e.target.value)}
              placeholder="e.g. A'B + AB' or (A+B)(A'+B')"
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3.5 py-2 font-mono text-sm text-emerald-400 placeholder-[#515970] focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Live Validation Result */}
          {expressionValidation && (
            <div className="p-3 bg-[#090b0f] border border-[#1e2332] rounded-lg space-y-2 text-xs">
              {expressionValidation.isValid ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>GRAMMAR VERIFIED • DETECTED VARIABLES: [{expressionValidation.variables.join(', ')}]</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-[#12141c] rounded border border-[#202535]">
                      <span className="text-[#6d768f] block text-[10px]">Canonical SOP:</span>
                      <span className="text-white font-bold">{expressionValidation.canonicalSop}</span>
                    </div>
                    <div className="p-2 bg-[#12141c] rounded border border-[#202535]">
                      <span className="text-[#6d768f] block text-[10px]">Canonical POS:</span>
                      <span className="text-white font-bold">{expressionValidation.canonicalPos}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>PARSER FAULT: {expressionValidation.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hardware & 3D Spatial Asset */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 pb-2 border-b border-[#1f2231]">
            [ 03 // TTL PACKAGES & 3D GEOMETRY ]
          </h2>

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-2">Required TTL 7400 ICs *</label>
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

          <div>
            <label className="block text-xs font-bold text-[#b0bacf] mb-1.5">3D Spatial CAD Asset *</label>
            <select
              value={modelAssetId}
              onChange={e => setModelAssetId(e.target.value)}
              className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.format.toUpperCase()} • {m.polyCount} polys)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wiring Procedure Builder */}
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2231]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              [ 04 // WIRING PROCEDURE STEPS ]
            </h2>
            <button
              type="button"
              onClick={handleAddStep}
              className="btn-tactile flex items-center gap-1 px-2.5 py-1 bg-[#141722] hover:bg-[#1a1e2b] text-[#b0bacf] hover:text-white text-xs font-bold rounded border border-[#252a3b] cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>ADD STEP</span>
            </button>
          </div>

          <div className="space-y-3">
            {instructions.map((step, idx) => (
              <div key={idx} className="p-3 bg-[#090b0f] border border-[#1e2332] rounded-lg space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400">STEP {step.step}</span>
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-[#646e86] hover:text-rose-400 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={step.title}
                    onChange={e => {
                      const copy = [...instructions];
                      copy[idx].title = e.target.value;
                      setInstructions(copy);
                    }}
                    placeholder="Step Title"
                    className="w-full bg-[#12141c] border border-[#202535] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <input
                    type="text"
                    value={step.wiringTips}
                    onChange={e => {
                      const copy = [...instructions];
                      copy[idx].wiringTips = e.target.value;
                      setInstructions(copy);
                    }}
                    placeholder="Wiring Tip (optional)"
                    className="w-full bg-[#12141c] border border-[#202535] rounded px-2.5 py-1.5 text-xs text-amber-300 placeholder-[#525a70] focus:outline-none focus:border-emerald-500 font-mono"
                  />
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
                  className="w-full bg-[#12141c] border border-[#202535] rounded px-2.5 py-1.5 text-xs text-[#a0a9c0] focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            ))}
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
            <span>{isSubmitting ? 'COMMITTING SPEC...' : 'PUBLISH EXPERIMENT'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
