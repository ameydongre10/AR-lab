import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, ZoomIn, ZoomOut, Maximize2, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

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
      setLoadError('Unable to render 3D GLB directly in this browser context. Fallback viewer active.');
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
    <div className={`relative w-full h-full min-h-[360px] bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden group shadow-2xl flex flex-col justify-center items-center ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin mb-3"></div>
          <p className="text-sm font-medium text-slate-300">Loading 3D AR Asset ({progress}%)</p>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {loadError && (
        <div className="absolute top-4 left-4 right-4 z-20 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200">{loadError}</p>
        </div>
      )}

      {/* Google Model Viewer Web Component */}
      {/* @ts-ignore */}
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        poster={posterUrl}
        alt={altText}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate={isAutoRotating ? '' : undefined}
        auto-rotate-delay="1000"
        rotation-per-second="25deg"
        shadow-intensity="1.2"
        shadow-softness="0.8"
        environment-image="neutral"
        exposure="1.0"
        loading="eager"
        style={{ width: '100%', height: '100%', minHeight: '360px', outline: 'none' }}
      >
        {/* Custom AR Button inside model-viewer */}
        {showArButton && (
          <button
            slot="ar-button"
            onClick={onArLaunch}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Launch Spatial AR
          </button>
        )}
      {/* @ts-ignore */}
      </model-viewer>

      {/* Floating 3D Controls Bar */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl p-1.5 shadow-xl">
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? 'Pause Rotation' : 'Auto Rotate'}
          className={`p-2 rounded-lg transition-colors ${isAutoRotating ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
