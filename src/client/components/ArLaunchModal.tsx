import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Camera, QrCode, CheckCircle2, AlertTriangle, ExternalLink, Compass } from 'lucide-react';
import { getAssetUrl } from '../services/assetUtils.ts';

interface ArLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelUrl: string;
  modelTitle: string;
}

export const ArLaunchModal: React.FC<ArLaunchModalProps> = ({
  isOpen,
  onClose,
  modelUrl,
  modelTitle
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hasWebXR, setHasWebXR] = useState<boolean>(false);
  const [launchStatus, setLaunchStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Detect mobile vs desktop
    const mobileCheck = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    // Detect WebXR capability
    if ('xr' in navigator && (navigator as any).xr?.isSessionSupported) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setHasWebXR(supported);
      }).catch(() => setHasWebXR(false));
    }

    // Build absolute URL for the QR code
    const fullUrl = window.location.href;
    QRCode.toDataURL(fullUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#0c0e14',
        light: '#f4f6fa'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [isOpen, modelUrl]);

  if (!isOpen) return null;

  const handleNativeArLaunch = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const resolvedUrl = getAssetUrl(modelUrl);
    const fullAssetUrl = new URL(resolvedUrl, window.location.href).href;

    setLaunchStatus('Initiating spatial camera calibration & plane detection...');

    if (isIOS) {
      // iOS Quick Look AR anchor
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute('href', fullAssetUrl);
      anchor.click();
    } else if (isAndroid) {
      // Android Scene Viewer Intent
      const sceneViewerUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
        fullAssetUrl
      )}&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(
        fullAssetUrl
      )};end;`;
      window.location.href = sceneViewerUrl;
    } else {
      // Trigger <model-viewer> AR mode
      const mv = document.querySelector('model-viewer') as any;
      if (mv && mv.activateAR) {
        mv.activateAR().catch((err: any) => {
          setLaunchStatus(`AR Notice: ${err.message || 'Please use an ARKit / ARCore enabled mobile device.'}`);
        });
      } else {
        setLaunchStatus('Desktop telemetry: Scan the optical QR target below with an iOS or Android smartphone.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050609]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0e1017] border border-[#262c3e] rounded-xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        
        {/* Corner Reticle Accents */}
        <div className="absolute top-2 left-2 text-[8px] font-mono text-[#424b61]">+ CALIB_A1</div>
        <div className="absolute bottom-2 right-2 text-[8px] font-mono text-[#424b61]">+ CALIB_B2</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-tactile absolute top-4 right-4 p-1.5 text-[#737c94] hover:text-white bg-[#161824] hover:bg-[#1d2130] border border-[#272d3f] rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#151824] border border-[#282f42] text-[10px] font-mono text-emerald-400">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>OPTICAL SPATIAL ALIGNMENT</span>
          </div>
          <h3 className="text-xl font-bold font-mono text-white tracking-tight">
            Launch AR Workbench
          </h3>
          <p className="text-xs text-[#828c9f]">
            Target asset: <span className="text-white font-mono">{modelTitle}</span>
          </p>
        </div>

        {/* Status Alert if triggered */}
        {launchStatus && (
          <div className="mb-4 p-3 rounded-lg bg-[#151722] border border-blue-500/30 text-xs font-mono text-blue-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>{launchStatus}</span>
          </div>
        )}

        {/* Dual Layout: Direct Launch (Mobile) or QR Optical Target (Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          
          {/* QR Target View */}
          <div className="sm:col-span-6 flex flex-col items-center">
            <div className="p-3 bg-white rounded-lg border border-[#3b4256] shadow-md relative">
              {/* Corner crosshairs */}
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-500"></div>
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-500"></div>
              <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-500"></div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-500"></div>

              {qrDataUrl ? (
                <img src={qrDataUrl} alt="AR Quick Launch Optical Target" className="w-40 h-40 object-contain" />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs font-mono text-[#5b637a]">
                  Generating Target...
                </div>
              )}
            </div>
            <div className="text-[10px] font-mono text-[#6e7790] mt-2 text-center">
              SCAN WITH SMARTPHONE CAMERA
            </div>
          </div>

          {/* Device Capabilities & Direct Launch */}
          <div className="sm:col-span-6 space-y-3 font-mono">
            <div className="space-y-1.5 text-xs">
              <div className="text-[10px] text-[#717a92] uppercase font-bold tracking-wider">
                SUBSYSTEM READINESS
              </div>
              
              <div className="flex items-center justify-between p-2 rounded bg-[#13151f] border border-[#202535]">
                <span className="text-[#a1abcb]">WebXR Immersive</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  hasWebXR ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1c1f2b] text-[#768098]'
                }`}>
                  {hasWebXR ? 'SUPPORTED' : 'STANDBY'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#13151f] border border-[#202535]">
                <span className="text-[#a1abcb]">Platform Profile</span>
                <span className="text-[10px] font-bold text-white">
                  {isMobile ? 'MOBILE AR' : 'WORKSTATION'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#13151f] border border-[#202535]">
                <span className="text-[#a1abcb]">Coordinate Anchor</span>
                <span className="text-[10px] font-bold text-emerald-400">
                  HORIZONTAL PLANE
                </span>
              </div>
            </div>

            <button
              onClick={handleNativeArLaunch}
              className="btn-tactile w-full py-2.5 bg-gradient-to-b from-[#1e2332] to-[#141722] hover:from-[#262c3e] hover:to-[#191d2a] text-emerald-300 border border-emerald-500/50 hover:border-emerald-400 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMobile ? 'ACTIVATE CAMERA AR' : 'TRIGGER WEBXR SESSION'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Notice */}
        <div className="mt-5 pt-4 border-t border-[#1c202d] flex items-center justify-between text-[10px] font-mono text-[#5f6880]">
          <span>REQUIREMENT: iOS 12+ (ARKit) OR ANDROID 8+ (ARCore)</span>
          <span className="text-emerald-400">CALIBRATED</span>
        </div>
      </div>
    </div>
  );
};
