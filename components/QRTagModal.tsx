'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, ExternalLink, Copy, Check, Sparkles, ShieldCheck, QrCode } from 'lucide-react';
import { Product } from '@/lib/types';
import { generateProductQRCode, getPublicVerificationUrl } from '@/lib/qr';

interface QRTagModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRTagModal({ product, isOpen, onClose }: QRTagModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (product) {
      generateProductQRCode(product.sku).then(setQrDataUrl);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const publicUrl = getPublicVerificationUrl(product.sku);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in no-print">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-modal relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Jewellery Barcode Tag</h2>
            <p className="text-xs text-slate-500">
              Print dumbbell sticker tag or verify hallmark specs on mobile.
            </p>
          </div>
        </div>

        {/* Printable Jewelry Tag Preview */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">
              SRI SHUBHAM SILVER
            </span>
            <div className="font-bold text-xs text-slate-900 truncate mt-0.5">{product.name}</div>
            <div className="text-[11px] text-slate-600 font-mono mt-1 space-y-0.5">
              <div>SKU: <strong>{product.sku}</strong></div>
              <div>NW: <strong>{product.netWeight}g</strong> | Purity: <strong>{product.purity}%</strong></div>
            </div>
          </div>

          <div className="flex flex-col items-center bg-white p-1.5 rounded-lg border border-slate-200 shadow-xs flex-shrink-0">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Product QR" className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-slate-100 animate-pulse rounded"></div>
            )}
            <span className="text-[8px] text-slate-400 font-mono mt-0.5">Scan on Mobile</span>
          </div>
        </div>

        {/* Public Verification Link */}
        <div className="space-y-1.5 mb-5 text-xs">
          <label className="text-slate-600 font-medium block">Public Verification URL (No Login Needed):</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-600 font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              title="Open Public Page"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sticker Tag</span>
          </button>
        </div>
      </div>
    </div>
  );
}
