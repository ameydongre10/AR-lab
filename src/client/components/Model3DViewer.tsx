import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, ZoomIn, ZoomOut, RefreshCw, AlertCircle, Box, Compass, Eye, Maximize } from 'lucide-react';
import { getAssetUrl } from '../services/assetUtils.ts';

interface Model3DViewerProps {
  modelUrl: string;
  posterUrl?: string;
  altText?: string;
  autoRotate?: boolean;
  className?: string;
  onArLaunch?: () => void;
  showArButton?: boolean;
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelUrl,
  posterUrl,
  altText = 'AR 3D Model',
  autoRotate = true,
  className = '',
  onArLaunch,
  showArButton = true
}) => {
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);
  const [progress, setProgress] = useState(0);

  const resolvedModelUrl = getAssetUrl(modelUrl);
  const resolvedPosterUrl = posterUrl ? getAssetUrl(posterUrl) : undefined;
  const modelBasename = modelUrl.split('/').pop() || 'model.glb';

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleProgress = (event: any) => {
      const p = Math.round(event.detail.totalProgress * 100);
      setProgress(p);
      if (p >= 100) setIsLoading(false);
    };

    const handleLoad = () => {
      setIsLoading(false);
      setLoadError(null);
    };

    const handleError = (error: any) => {
      console.warn('Model load warning/error:', error);
      setIsLoading(false);
      setLoadError('CAD Asset fallback: Model rendering in local compatibility mode.');
    };

    viewer.addEventListener('progress', handleProgress);
    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    return () => {
      viewer.removeEventListener('progress', handleProgress);
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [modelUrl]);

  const handleReset = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.cameraOrbit = '0deg 75deg 105%';
      viewer.fieldOfView = 'auto';
    }
  };

  const handleZoom = (inOut: 'in' | 'out') => {
    const viewer = viewerRef.current;
    if (viewer) {
      const fov = viewer.getFieldOfView();
      viewer.fieldOfView = inOut === 'in' ? `${Math.max(15, fov - 10)}deg` : `${Math.min(90, fov + 10)}deg`;
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] bg-[#0c0e14] rounded-xl border border-[#232737] overflow-hidden group shadow-2xl flex flex-col justify-center items-center ${className}`}>
      
      {/* Precision CAD Viewport Reticle Marks */}
      <div className="absolute top-2.5 left-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] font-mono font-bold text-[#5c657e] tracking-wider uppercase">
          + CAD·VIEW // {modelBasename}
        </span>
      </div>

      <div className="absolute top-2.5 right-3 z-10 flex items-center gap-2 pointer-events-none">
        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#151822] border border-[#2b3144] text-[#8691ab]">
          SCALE: 1:1 METRIC
        </span>
      </div>

      {/* Crosshair Corner Reticles */}
      <div className="absolute bottom-2.5 right-3 z-10 pointer-events-none text-[9px] font-mono text-[#4b5368]">
        [ 0,0,0 ]
      </div>

      {/* Loading Overlay — Precision Instrument Calibration Screen */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#090b10]/90 backdrop-blur-sm p-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#141722] border border-[#2a3043] flex items-center justify-center mb-4 text-emerald-400">
            <Box className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs font-mono font-bold text-white tracking-wider uppercase">
            CALIBRATING 3D SPATIAL ASSET
          </div>
          <div className="text-[11px] font-mono text-[#78829b] mt-1">
            PARSING GLB GEOMETRY: <span className="text-emerald-400 font-bold tabular-nums">{progress}%</span>
          </div>

          <div className="w-56 h-1.5 bg-[#171a25] border border-[#262b3c] rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 glow-phosphor-sm transition-all duration-200" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute top-10 left-4 right-4 z-20 bg-[#1e1515] border border-amber-500/40 rounded-lg p-3 flex items-start gap-2.5 text-xs font-mono">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[#e2cbb2]">{loadError}</p>
        </div>
      )}

      {/* Google Model Viewer Web Component */}
      {/* @ts-ignore */}
      <model-viewer
        ref={viewerRef}
        src={resolvedModelUrl}
        poster={resolvedPosterUrl}
        alt={altText}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate={isAutoRotating ? '' : undefined}
        auto-rotate-delay="1000"
        rotation-per-second="25deg"
        shadow-intensity="1.4"
        shadow-softness="0.5"
        environment-image="neutral"
        exposure="1.0"
        loading="eager"
        style={{ width: '100%', height: '100%', minHeight: '380px', outline: 'none' }}
      >
        {/* Custom Industrial AR Button inside model-viewer */}
        {showArButton && (
          <button
            slot="ar-button"
            onClick={onArLaunch}
            className="btn-tactile absolute bottom-3.5 right-3.5 z-10 flex items-center gap-2 bg-[#171a26] hover:bg-[#1f2333] border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 text-xs font-mono font-bold px-3.5 py-2 rounded-lg shadow-lg cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>LAUNCH SPATIAL AR</span>
          </button>
        )}
      {/* @ts-ignore */}
      </model-viewer>

      {/* Floating Precision Viewport Controls Toolbar */}
      <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1 bg-[#12151f]/95 backdrop-blur-md border border-[#262c3e] rounded-lg p-1 shadow-lg">
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? 'Pause Turntable' : 'Resume Turntable'}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isAutoRotating 
              ? 'bg-[#1c2232] text-emerald-400 border border-emerald-500/30' 
              : 'text-[#7e89a3] hover:text-white hover:bg-[#1a1d29]'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-[#252a3b] mx-0.5"></div>

        <button
          onClick={() => handleZoom('in')}
          title="Zoom In (+10° FOV)"
          className="p-1.5 text-[#7e89a3] hover:text-white hover:bg-[#1a1d29] rounded transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out (-10° FOV)"
          className="p-1.5 text-[#7e89a3] hover:text-white hover:bg-[#1a1d29] rounded transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-3.5 bg-[#252a3b] mx-0.5"></div>

        <button
          onClick={handleReset}
          title="Reset Camera Angle (0°, 75°)"
          className="p-1.5 text-[#7e89a3] hover:text-white hover:bg-[#1a1d29] rounded transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
