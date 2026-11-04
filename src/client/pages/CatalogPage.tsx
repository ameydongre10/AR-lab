import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Experiment, Category } from '../types/index.ts';
import { Search, Filter, Layers, Plus, ArrowRight, Trash2, Edit3, Grid, List, AlertCircle, Cpu, ChevronRight } from 'lucide-react';

interface CatalogPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigate }) => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedForm, setSelectedForm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      api.getExperiments({
        search: searchTerm,
        categoryId: selectedCategory || undefined,
        canonicalForm: selectedForm || undefined,
        difficulty: selectedDifficulty || undefined
      }),
      api.getCategories()
    ])
      .then(([expRes, catRes]) => {
        setExperiments(expRes.items);
        setCategories(catRes);
      })
      .catch(err => console.error('Error fetching catalog data:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory, selectedForm, selectedDifficulty]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExperiment(id);
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete experiment:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-mono">
      
      {/* 1. Industrial Curriculum Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#202535]">
        <div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
            [ ARCHIVE INDEX // CURRICULUM REGISTRY ]
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            Laboratory Experiment Catalog
          </h1>
          <p className="text-xs text-[#828ca1] mt-1 font-sans">
            Browse and launch digital electronics experiments or author new curriculum modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create')}
            className="btn-tactile flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW EXPERIMENT</span>
          </button>
        </div>
      </div>

      {/* 2. Precision Filter Console */}
      <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-4 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-3.5 h-3.5 text-[#5f6880] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by title, expression, or theory..."
              className="w-full bg-[#090b0f] border border-[#232737] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#51596f] focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-[#090b0f] border border-[#232737] rounded-lg px-3 py-1.5 text-xs text-[#b0bacf] focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Form Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedForm}
              onChange={e => setSelectedForm(e.target.value)}
              className="w-full bg-[#090b0f] border border-[#232737] rounded-lg px-3 py-1.5 text-xs text-[#b0bacf] focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
            >
              <option value="">All Forms</option>
              <option value="SOP">SOP Form</option>
              <option value="POS">POS Form</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="sm:col-span-2 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`btn-tactile p-1.5 rounded-lg border transition-colors cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-[#1b202e] text-emerald-400 border-emerald-500/40' 
                  : 'bg-[#12141c] text-[#6d768e] border-[#222636] hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn-tactile p-1.5 rounded-lg border transition-colors cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-[#1b202e] text-emerald-400 border-emerald-500/40' 
                  : 'bg-[#12141c] text-[#6d768e] border-[#222636] hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Catalog Render: Grid or List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-[#202535] border-t-emerald-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-[#717a94] font-mono">SCANNING CURRICULUM ARCHIVE...</p>
        </div>
      ) : experiments.length === 0 ? (
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl p-12 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#141620] border border-[#262c3e] flex items-center justify-center text-[#6e7790] mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Experiments Match Criteria</h3>
          <p className="text-xs text-[#79839b] max-w-sm mx-auto font-sans">
            Adjust your search query or reset filters to display curriculum modules.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedForm('');
              setSelectedDifficulty('');
            }}
            className="btn-tactile text-xs text-emerald-400 hover:underline pt-2 inline-block cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {experiments.map((exp, idx) => (
            <div
              key={exp.id}
              className="bg-[#0f1118] border border-[#232737] hover:border-[#3d455e] rounded-xl p-5 shadow-lg flex flex-col justify-between group transition-all duration-150 relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold px-1.5 py-0.5 rounded bg-[#161a25] text-emerald-400 border border-emerald-500/30">
                    {exp.canonicalForm} FORM
                  </span>
                  <span className="text-[#6d768f] uppercase">
                    LVL: {exp.difficulty}
                  </span>
                </div>

                <h3
                  onClick={() => onNavigate('experiment', exp.id)}
                  className="text-base font-bold text-white tracking-tight cursor-pointer group-hover:text-emerald-300 transition-colors font-sans"
                >
                  {exp.title}
                </h3>

                <p className="text-xs text-[#808a9f] line-clamp-3 leading-relaxed font-sans">
                  {exp.description}
                </p>

                {/* Required IC Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {exp.requiredIcs.map(ic => (
                    <span
                      key={ic}
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#141722] text-[#8e98b0] border border-[#232839]"
                    >
                      SN{ic}N
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#1a1e2b] mt-4 flex items-center justify-between text-xs">
                <div className="text-emerald-400 font-bold text-[11px]">
                  F = {exp.targetExpression}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('edit', exp.id)}
                    title="Edit Experiment"
                    className="btn-tactile p-1.5 text-[#737c94] hover:text-white bg-[#141722] hover:bg-[#1b1f2e] border border-[#222737] rounded-lg cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(exp.id)}
                    title="Delete Experiment"
                    className="btn-tactile p-1.5 text-[#737c94] hover:text-rose-400 bg-[#141722] hover:bg-[#1b1f2e] border border-[#222737] rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onNavigate('experiment', exp.id)}
                    className="btn-tactile flex items-center gap-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    <span>LAUNCH</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode Table */
        <div className="bg-[#0f1118] border border-[#232737] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0a0c12] text-[#717a94] border-b border-[#232737]">
                <tr>
                  <th className="px-5 py-3 text-white">EXPERIMENT MODULE</th>
                  <th className="px-4 py-3">FORM</th>
                  <th className="px-4 py-3">BOOLEAN TARGET</th>
                  <th className="px-4 py-3">REQUIRED ICS</th>
                  <th className="px-4 py-3">DIFFICULTY</th>
                  <th className="px-5 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171a26]">
                {experiments.map(exp => (
                  <tr key={exp.id} className="hover:bg-[#13151f] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white font-sans">
                      <button
                        onClick={() => onNavigate('experiment', exp.id)}
                        className="hover:text-emerald-400 text-left transition-colors cursor-pointer"
                      >
                        {exp.title}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#161a25] text-emerald-400 border border-emerald-500/30 font-bold">
                        {exp.canonicalForm}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-emerald-300 font-bold">
                      {exp.targetExpression}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 text-[10px] text-[#8e98b0]">
                        {exp.requiredIcs.join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#737c94] uppercase">{exp.difficulty}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('edit', exp.id)}
                          className="btn-tactile p-1 text-[#737c94] hover:text-white bg-[#141722] border border-[#222737] rounded cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="btn-tactile p-1 text-[#737c94] hover:text-rose-400 bg-[#141722] border border-[#222737] rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onNavigate('experiment', exp.id)}
                          className="btn-tactile px-2.5 py-1 bg-emerald-500 text-[#090b10] font-bold rounded hover:bg-emerald-400 transition-colors cursor-pointer"
                        >
                          LAUNCH
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1017] border border-[#2a2f42] rounded-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CONFIRM MODULE DELETION
            </h3>
            <p className="text-xs text-[#828c9f] leading-relaxed font-sans">
              Permanently purge this experiment definition and associated student verification telemetry? This action cannot be reverted.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-tactile px-3.5 py-1.5 text-xs text-[#828c9f] hover:text-white bg-[#151822] border border-[#242939] rounded-lg cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-tactile px-3.5 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm font-bold cursor-pointer"
              >
                PURGE MODULE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
