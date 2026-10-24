import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Camera, QrCode, Sparkles, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

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
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [isOpen, modelUrl]);

  if (!isOpen) return null;

  const handleNativeArLaunch = () => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    setLaunchStatus('Initializing camera & spatial tracking...');

    if (isIOS) {
      // iOS Quick Look AR anchor
      const anchor = document.createElement('a');
      anchor.setAttribute('rel', 'ar');
      anchor.setAttribute('href', modelUrl);
      anchor.click();
    } else if (isAndroid) {
      // Android Scene Viewer Intent
      const fullAssetUrl = new URL(modelUrl, window.location.origin).href;
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
          setLaunchStatus(`AR launch notice: ${err.message || 'Please use an AR-compatible mobile browser.'}`);
        });
      } else {
        setLaunchStatus('Desktop browser detected: Please scan the QR code with your mobile device.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Launch Augmented Reality</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{modelTitle}</p>
          </div>
        </div>

        {/* Content based on Device */}
        {isMobile ? (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-cyan-200">Mobile Device Detected</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Camera permissions will be requested to track a horizontal surface (tabletop or floor) and overlay the virtual digital electronics circuit into your physical room.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>WebXR & Google Scene Viewer / Apple Quick Look supported</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Camera feed is processed locally on-device and never stored</span>
              </div>
            </div>

            {launchStatus && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-cyan-300">
                {launchStatus}
              </div>
            )}

            <button
              onClick={handleNativeArLaunch}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer active:scale-98"
            >
              <Camera className="w-5 h-5" />
              Start Interactive AR Session
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-sm text-slate-300 mb-4">
                To project this 3D circuit into your real-world physical space, scan this QR code using your phone camera (iOS Safari or Android Chrome):
              </p>

              {/* QR Code Container */}
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl shadow-cyan-950/50">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Scan QR for AR" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-start gap-3">
              <QrCode className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">Instant Cross-Platform Handoff:</span> Opening the link on mobile instantly presents the one-tap spatial AR launcher with 1:1 scale placement.
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={handleNativeArLaunch}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Test Mobile WebXR In Browser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
