import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Experiment, Category } from '../types/index.ts';
import { Search, Filter, Layers, Plus, ArrowRight, Trash2, Edit3, Sparkles, Grid, List, AlertCircle } from 'lucide-react';

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
    <div className="space-y-8 pb-16">
      {/* Catalog Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Experiment Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and launch digital electronics experiments or author new curriculum modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Experiment
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search experiments by title, expression, or theory..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
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
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${
                viewMode === 'list' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Experiment Cards / List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-400">Loading catalog items...</p>
        </div>
      ) : experiments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Experiments Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No experiments match your search criteria. Try adjusting your query or create a new experiment.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedForm('');
              setSelectedDifficulty('');
            }}
            className="text-xs font-semibold text-cyan-400 hover:underline pt-2 inline-block"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map(exp => (
            <div
              key={exp.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between group transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {exp.canonicalForm} Form
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {exp.difficulty}
                  </span>
                </div>

                <h3
                  onClick={() => onNavigate('experiment', exp.id)}
                  className="text-base font-bold text-white tracking-tight cursor-pointer group-hover:text-cyan-400 transition-colors"
                >
                  {exp.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {exp.description}
                </p>

                {/* Chips Needed */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {exp.requiredIcs.map(ic => (
                    <span
                      key={ic}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      SN{ic}N
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-slate-800/80 mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono text-cyan-300 text-xs">
                  <span>F = {exp.targetExpression}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('edit', exp.id)}
                    title="Edit Experiment"
                    className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(exp.id)}
                    title="Delete Experiment"
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigate('experiment', exp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode Table */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Experiment Title</th>
                  <th className="px-4 py-3">Canonical Form</th>
                  <th className="px-4 py-3">Expression</th>
                  <th className="px-4 py-3">Required ICs</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {experiments.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      <button
                        onClick={() => onNavigate('experiment', exp.id)}
                        className="hover:text-cyan-400 text-left transition-colors cursor-pointer"
                      >
                        {exp.title}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {exp.canonicalForm}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-cyan-300 font-semibold">
                      {exp.targetExpression}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 font-mono text-[10px]">
                        {exp.requiredIcs.join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{exp.difficulty}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('edit', exp.id)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onNavigate('experiment', exp.id)}
                          className="px-2.5 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-colors cursor-pointer"
                        >
                          Launch
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Delete Experiment?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this experiment? Associated student lab session runs will be cleaned up. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
