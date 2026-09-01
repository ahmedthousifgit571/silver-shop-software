'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, ExternalLink, Copy, Check, QrCode } from 'lucide-react';
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
  const [tagCopies, setTagCopies] = useState<number>(1);

  useEffect(() => {
    if (product) {
      generateProductQRCode(product.sku).then(setQrDataUrl);
      setTagCopies(1);
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
    if (!product || !qrDataUrl) return;

    // Create an isolated hidden iframe specifically for printing the sticker
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (!doc) return;

    // Generate tags based on requested copies
    const tagsHtml = Array.from({ length: Math.max(1, tagCopies) })
      .map(
        () => `
        <div class="tag-card">
          <div class="tag-details">
            <div class="brand-title">KUSHAL JEWELLERYS</div>
            <div class="prod-name">${product.name}</div>
            <div class="specs">
              <div>SKU: <strong>${product.sku}</strong></div>
              <div>NW: <strong>${product.netWeight.toFixed(2)}g</strong> | GW: <strong>${product.grossWeight.toFixed(2)}g</strong></div>
              <div>Purity: <strong>${product.purity}% (${product.purityGrade || '925'})</strong></div>
            </div>
          </div>
          <div class="qr-side">
            <img class="qr-img" src="${qrDataUrl}" alt="QR" />
            <span class="qr-caption">SCAN TO VERIFY</span>
          </div>
        </div>
      `
      )
      .join('');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sticker Tag - ${product.sku}</title>
          <style>
            @page {
              size: auto;
              margin: 3mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              background: #ffffff;
              color: #000000;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              gap: 8px;
              padding: 4px;
            }
            .tag-card {
              width: 72mm;
              height: 28mm;
              border: 1px dashed #333333;
              border-radius: 4px;
              padding: 4px 6px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              page-break-inside: avoid;
              background: #ffffff;
            }
            .tag-details {
              flex: 1;
              min-width: 0;
              padding-right: 6px;
            }
            .brand-title {
              font-size: 8px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #000000;
              margin-bottom: 2px;
            }
            .prod-name {
              font-size: 10px;
              font-weight: 700;
              line-height: 1.15;
              margin-bottom: 3px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .specs {
              font-size: 8px;
              line-height: 1.35;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
              color: #111111;
            }
            .specs strong {
              color: #000000;
              font-weight: 800;
            }
            .qr-side {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .qr-img {
              width: 60px;
              height: 60px;
              object-fit: contain;
            }
            .qr-caption {
              font-size: 6px;
              font-weight: 700;
              font-family: ui-monospace, monospace;
              text-align: center;
              margin-top: 1px;
            }
          </style>
        </head>
        <body>
          ${tagsHtml}
        </body>
      </html>
    `);
    doc.close();

    // Trigger printing from the isolated iframe
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }, 250);
  };

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
            <span className="text-[10px] text-slate-400 font-mono uppercase block font-semibold">
              KUSHAL JEWELLERYS
            </span>
            <div className="font-bold text-xs text-slate-900 truncate mt-0.5">{product.name}</div>
            <div className="text-[11px] text-slate-600 font-mono mt-1 space-y-0.5">
              <div>SKU: <strong>{product.sku}</strong></div>
              <div>NW: <strong>{product.netWeight.toFixed(2)}g</strong> | GW: <strong>{product.grossWeight.toFixed(2)}g</strong></div>
              <div>Purity: <strong>{product.purity}% ({product.purityGrade || '925'})</strong></div>
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

        {/* Tag Copies & Action Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-600 font-medium">Copies:</label>
            <input
              type="number"
              min="1"
              max="100"
              value={tagCopies}
              onChange={(e) => setTagCopies(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
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
    </div>
  );
}
