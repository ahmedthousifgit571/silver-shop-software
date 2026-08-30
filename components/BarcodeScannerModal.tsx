'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Camera, QrCode, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const [manualInput, setManualInput] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    let scannerInstance: any = null;

    if (isOpen) {
      setCameraError(null);
      setScannedCode(null);

      import('html5-qrcode')
        .then(({ Html5Qrcode }) => {
          const qrRegionId = 'qr-reader-region';
          const element = document.getElementById(qrRegionId);

          if (!element) return;

          scannerInstance = new Html5Qrcode(qrRegionId);
          html5QrCodeRef.current = scannerInstance;

          scannerInstance
            .start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
              },
              (decodedText: string) => {
                handleCodeDetected(decodedText);
              },
              () => {}
            )
            .then(() => {
              setIsScanning(true);
            })
            .catch(() => {
              setCameraError(
                'Camera access not available or permission denied. Please enter SKU manually below.'
              );
              setIsScanning(false);
            });
        })
        .catch(() => {
          setCameraError('Unable to initialize QR reader library.');
        });
    }

    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current?.clear();
          })
          .catch(() => {});
      }
    };
  }, [isOpen]);

  const handleCodeDetected = (rawText: string) => {
    let sku = rawText.trim();
    if (sku.includes('/p/')) {
      const parts = sku.split('/p/');
      sku = parts[parts.length - 1];
    }

    setScannedCode(sku);

    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch(() => {});
    }

    setTimeout(() => {
      onScanSuccess(sku);
      onClose();
    }, 400);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onScanSuccess(manualInput.trim().toUpperCase());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-modal relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Barcode & QR Scanner</h2>
            <p className="text-xs text-slate-500">
              Point camera at jewelry label or PDF bill QR code.
            </p>
          </div>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 min-h-[260px] flex items-center justify-center mb-4">
          <div id="qr-reader-region" className="w-full h-full"></div>

          {cameraError && (
            <div className="absolute inset-0 bg-slate-50 p-6 flex flex-col items-center justify-center text-center text-xs text-slate-600">
              <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
              <p className="font-semibold text-slate-800">Camera Unavailable</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">{cameraError}</p>
            </div>
          )}

          {scannedCode && (
            <div className="absolute inset-0 bg-emerald-500/90 text-white flex flex-col items-center justify-center text-center p-4 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 mb-2" />
              <span className="text-xs font-medium">Product Code Detected:</span>
              <span className="text-base font-mono font-bold">{scannedCode}</span>
            </div>
          )}
        </div>

        {/* Manual SKU Input */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Or Type Product SKU Manually:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. SLV-ANK-925-001"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1 flex-shrink-0"
              >
                <span>Add</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
