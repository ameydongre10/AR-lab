import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ModelAsset } from '../types/index.ts';
import { Model3DViewer } from '../components/Model3DViewer.tsx';
import { ArLaunchModal } from '../components/ArLaunchModal.tsx';
import { Box, Plus, Trash2, Edit3, Sparkles, ExternalLink, AlertCircle, Eye, X } from 'lucide-react';

interface AssetManagerPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AssetManagerPage: React.FC<AssetManagerPageProps> = ({ onNavigate }) => {
  const [models, setModels] = useState<ModelAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewModel, setPreviewModel] = useState<ModelAsset | null>(null);
  const [isArModalOpen, setIsArModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New model state
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('/models/');
  const [newFormat, setNewFormat] = useState<'glb' | 'gltf' | 'usdz'>('glb');
  const [newPlacement, setNewPlacement] = useState<'table' | 'floor'>('table');
  const [newPolys, setNewPolys] = useState(500);

  const loadModels = () => {
    setIsLoading(true);
    api.getModels()
      .then(res => setModels(res))
      .catch(err => console.error('Error loading 3D models:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleDelete = async (id: string) => {
    setErrorMsg(null);
    try {
      await api.deleteModel(id);
      loadModels();
    } catch (err: any) {
      setErrorMsg(err.message || 'Cannot delete model asset.');
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    try {
      await api.createModel({
        name: newName,
        description: newDesc,
        fileUrl: newUrl,
        format: newFormat,
        arPlacement: newPlacement,
        polyCount: newPolys,
        scale: 1.0,
        dimensions: { width: 0.2, height: 0.1, depth: 0.2 },
        posterUrl: '/posters/default.png'
      });

      setIsAddModalOpen(false);
      setNewName('');
      setNewDesc('');
      loadModels();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">3D Spatial Assets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage GLB, glTF, and USDZ models used for WebXR and mobile AR electronics simulations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add 3D Asset
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Model Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-400">Loading 3D asset catalogue...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map(model => (
            <div
              key={model.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                    {model.format.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {model.polyCount} Polygons
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{model.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{model.description}</p>

                <div className="text-[11px] font-mono text-slate-500 truncate">
                  Path: {model.fileUrl}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setPreviewModel(model)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive 3D</span>
                </button>

                <button
                  onClick={() => handleDelete(model.id)}
                  title="Delete Model"
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3D Preview & AR Modal */}
      {previewModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{previewModel.name}</h3>
                <p className="text-xs text-slate-400">{previewModel.description}</p>
              </div>
              <button
                onClick={() => setPreviewModel(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[380px] w-full">
              <Model3DViewer
                modelUrl={previewModel.fileUrl}
                altText={previewModel.name}
                onArLaunch={() => setIsArModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Model Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Register New 3D Spatial Model</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. SN7486 Quad XOR DIP-14"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset URL Path *</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="/models/filename.glb"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={e => setNewFormat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="glb">GLB (Binary glTF)</option>
                    <option value="gltf">glTF (JSON)</option>
                    <option value="usdz">USDZ (iOS AR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Placement Surface</label>
                  <select
                    value={newPlacement}
                    onChange={e => setNewPlacement(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="table">Tabletop Surface</option>
                    <option value="floor">Floor Plane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Model geometry details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  Save Model
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AR Modal */}
      {previewModel && (
        <ArLaunchModal
          isOpen={isArModalOpen}
          onClose={() => setIsArModalOpen(false)}
          modelUrl={previewModel.fileUrl}
          modelTitle={previewModel.name}
        />
      )}
    </div>
  );
};
