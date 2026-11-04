import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ModelAsset } from '../types/index.ts';
import { Model3DViewer } from '../components/Model3DViewer.tsx';
import { ArLaunchModal } from '../components/ArLaunchModal.tsx';
import { Box, Plus, Trash2, AlertCircle, Eye, X, Compass, Terminal } from 'lucide-react';

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
    <div className="space-y-8 pb-16 font-mono">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#202535]">
        <div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
            [ ASSET VAULT // CAD GEOMETRY REPOSITORY ]
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
            3D Spatial Assets
          </h1>
          <p className="text-xs text-[#828ca1] mt-1 font-sans">
            Manage GLB, glTF, and USDZ models used for WebXR and mobile AR electronics simulations.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-tactile flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>REGISTER 3D ASSET</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#1e1515] border border-rose-500/40 rounded-lg flex items-center justify-between gap-2.5 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-[#848ea4] hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Model Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-2 border-[#202535] border-t-emerald-500 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-[#717a94]">INDEXING CAD GEOMETRY REPOSITORIES...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {models.map(model => (
            <div
              key={model.id}
              className="bg-[#0f1118] border border-[#232737] hover:border-[#384059] rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold px-1.5 py-0.5 rounded bg-[#161a25] text-blue-400 border border-blue-500/30 uppercase">
                    {model.format} FORMAT
                  </span>
                  <span className="text-[#6d768f] tabular-nums">
                    {model.polyCount} POLYGONS
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight font-sans">{model.name}</h3>
                <p className="text-xs text-[#808a9f] leading-relaxed line-clamp-2 font-sans">{model.description}</p>

                <div className="text-[10px] text-[#555d73] truncate bg-[#0a0c12] p-2 rounded border border-[#1a1e2b]">
                  URI: {model.fileUrl}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1a1e2b] flex items-center justify-between">
                <button
                  onClick={() => setPreviewModel(model)}
                  className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 bg-[#141722] hover:bg-[#1a1e2c] text-white text-xs font-bold rounded-lg border border-[#252a3b] transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CAD VIEWPORT</span>
                </button>

                <button
                  onClick={() => handleDelete(model.id)}
                  title="Purge CAD Model"
                  className="btn-tactile p-1.5 text-[#6b758d] hover:text-rose-400 bg-[#141722] border border-[#222737] rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0e1017] border border-[#262c3e] rounded-xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2231]">
              <div>
                <h3 className="text-base font-bold text-white font-sans">{previewModel.name}</h3>
                <p className="text-xs text-[#7d87a1] font-sans">{previewModel.description}</p>
              </div>
              <button
                onClick={() => setPreviewModel(null)}
                className="btn-tactile p-1.5 text-[#737c94] hover:text-white bg-[#151822] border border-[#242939] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
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

      {/* Register Model Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e1017] border border-[#262c3e] rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2231]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                REGISTER 3D CAD GEOMETRY SPECIFICATION
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#646e86] hover:text-white p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateModel} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#b0bacf] mb-1">Model Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. SN7486 Quad XOR DIP-14"
                  className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b0bacf] mb-1">Asset URL Path *</label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="/models/filename.glb"
                  className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#b0bacf] mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={e => setNewFormat(e.target.value as any)}
                    className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="glb">GLB (Binary glTF)</option>
                    <option value="gltf">glTF (JSON)</option>
                    <option value="usdz">USDZ (iOS Quick Look)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b0bacf] mb-1">Surface Plane</label>
                  <select
                    value={newPlacement}
                    onChange={e => setNewPlacement(e.target.value as any)}
                    className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                  >
                    <option value="table">Tabletop Bench</option>
                    <option value="floor">Floor Plane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b0bacf] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="CAD asset geometry details..."
                  className="w-full bg-[#090b0f] border border-[#222737] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-tactile px-3.5 py-1.5 text-xs text-[#828c9f] hover:text-white bg-[#151822] border border-[#242939] rounded-lg cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-tactile px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#090b10] font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                >
                  PERSIST ASSET
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
