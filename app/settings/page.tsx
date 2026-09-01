'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Building2,
} from 'lucide-react';
import { ShopConfig } from '@/lib/types';
import { initialShopConfig } from '@/lib/storage';

export default function SettingsPage() {
  const [config, setConfig] = useState<ShopConfig>(initialShopConfig);
  const [printerWidth, setPrinterWidth] = useState<'80mm' | '58mm'>('80mm');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load printer width preference from localStorage or config
    const savedPrinterWidth = localStorage.getItem('pos_printer_width') as '80mm' | '58mm';
    if (savedPrinterWidth === '80mm' || savedPrinterWidth === '58mm') {
      setPrinterWidth(savedPrinterWidth);
    }

    // Fetch live shop configuration from database
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.shopName) {
          setConfig(data);
          if (data.printerWidth) {
            setPrinterWidth(data.printerWidth);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load store settings:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updatedConfig = {
        ...config,
        printerWidth,
      };

      // 1. Save store settings to database
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings to database');
      }

      const savedData = await res.json();
      setConfig(savedData);

      // 2. Save printer preference to localStorage
      localStorage.setItem('pos_printer_width', printerWidth);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPrintThermal = () => {
    const is58 = printerWidth === '58mm';
    const paperWidth = is58 ? '54mm' : '76mm';
    const printableWidth = is58 ? '52mm' : '72mm';
    const fontSize = is58 ? '9px' : '11px';
    const headerSize = is58 ? '11px' : '13px';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Receipt ${printerWidth}</title>
          <style>
            @page {
              size: ${paperWidth} auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              width: ${printableWidth};
              margin: 0 auto;
              padding: 4px 2px;
              font-family: 'Courier New', Courier, monospace;
              font-size: ${fontSize};
              line-height: 1.2;
              color: #000;
              background: #fff;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }
            .border-double { border-top: 2px solid #000; }
            .py-1 { padding-top: 3px; padding-bottom: 3px; }
            .py-2 { padding-top: 5px; padding-bottom: 5px; }
            .flex-between { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="text-center border-b py-1">
            <div style="font-size: ${headerSize}; font-weight: 900; text-transform: uppercase;">
              ${config.shopName}
            </div>
            ${config.legalName ? `<div style="font-size: 7.5px;">Prop: ${config.legalName}</div>` : ''}
            <div style="font-size: 8px; margin-top: 1px;">${config.address}</div>
            <div style="font-size: 8.5px; font-weight: bold; margin-top: 1px;">Ph: ${config.phone}</div>
            ${config.gstin ? `<div style="font-size: 8.5px;">GSTIN: ${config.gstin}</div>` : ''}
          </div>

          <div class="border-b py-1" style="font-size: ${is58 ? '8.5px' : '9.5px'};">
            <div class="flex-between">
              <span class="font-bold">TEST RECEIPT (${printerWidth})</span>
              <span>${new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div>Mode: <span class="font-bold">THERMAL TEST PRINT</span></div>
          </div>

          <div class="border-b py-1 font-bold flex-between" style="font-size: ${is58 ? '8px' : '9.5px'};">
            <span>Item (Sample)</span>
            <span>Total</span>
          </div>

          <div class="py-1">
            <div style="margin-bottom: 3px;">
              <div style="font-weight: bold;">Silver Pooja Diya Pair</div>
              <div class="flex-between" style="font-size: ${is58 ? '8.5px' : '10px'};">
                <span>84.00g @ ₹89/g</span>
                <span class="font-bold">₹7,476</span>
              </div>
            </div>
          </div>

          <div class="border-t py-1" style="font-size: ${is58 ? '8.5px' : '10px'};">
            <div class="flex-between">
              <span>GST (3%):</span>
              <span>₹224.28</span>
            </div>
            <div class="flex-between font-bold border-double" style="font-size: ${headerSize}; padding-top: 3px; margin-top: 2px;">
              <span>NET TOTAL:</span>
              <span>₹7,700.00</span>
            </div>
          </div>

          <div class="text-center border-t py-2">
            <div style="font-size: 8px; font-weight: bold;">
              Thermal Printer (${printerWidth}) Ready!
            </div>
            <div style="font-size: 6.5px; color: #555; margin-top: 2px;">
              * Exchange within 7 days against invoice *
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-xs font-semibold">Loading store settings from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex-shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span>Store Configuration & Printing</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Store identity, GSTIN registration, invoice branding, and thermal receipt setup.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>Store settings successfully saved to database!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
        {/* Store Profile & GST Registration Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Store Profile & GST Registration Certificate Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trade Name / Store Name *
              </label>
              <input
                type="text"
                required
                value={config.shopName}
                onChange={(e) => setConfig({ ...config, shopName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Name / Proprietor Name
              </label>
              <input
                type="text"
                value={config.legalName || ''}
                onChange={(e) => setConfig({ ...config, legalName: e.target.value })}
                placeholder="DASS GHNANABAVARI"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Number (Form GST REG-06) *
              </label>
              <input
                type="text"
                value={config.gstin || ''}
                onChange={(e) => setConfig({ ...config, gstin: e.target.value })}
                placeholder="37AVEPG9436B1ZP"
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                HSN / SAC Code (Jewellery)
              </label>
              <input
                type="text"
                value={config.hsnCode || '7113'}
                onChange={(e) => setConfig({ ...config, hsnCode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Mobile Phone</label>
              <input
                type="tel"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                value={config.email || ''}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Principal Place of Business / Full Address (Printed on Invoices)
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
              <input
                type="text"
                value={config.city || 'Srikalahasti'}
                onChange={(e) => setConfig({ ...config, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State & PIN Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.state || 'Andhra Pradesh'}
                  onChange={(e) => setConfig({ ...config, state: e.target.value })}
                  placeholder="State"
                  className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
                <input
                  type="text"
                  value={config.pincode || '517644'}
                  onChange={(e) => setConfig({ ...config, pincode: e.target.value })}
                  placeholder="PIN"
                  className="w-24 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Printing & Thermal Setup Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-4 h-4 text-slate-700" />
              <span>POS Receipt Roll Width & Printer Setup</span>
            </h2>
            <button
              type="button"
              onClick={handleTestPrintThermal}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
              title="Test print a sample thermal receipt slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Test Print ({printerWidth})</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Active Thermal Slip Roll Width (Applied to POS Counter & Invoices)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`flex items-start gap-3 cursor-pointer border p-3.5 rounded-2xl transition ${
                    printerWidth === '80mm'
                      ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="printerWidth"
                    checked={printerWidth === '80mm'}
                    onChange={() => setPrinterWidth('80mm')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">80mm Standard POS Roll</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Recommended for Epson TM-T82, TVS RP-3200, Posiflex, and full desktop billing counters.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 cursor-pointer border p-3.5 rounded-2xl transition ${
                    printerWidth === '58mm'
                      ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="printerWidth"
                    checked={printerWidth === '58mm'}
                    onChange={() => setPrinterWidth('58mm')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">58mm Compact Roll</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Optimized for 2-inch mini thermal printers, handheld Bluetooth printers, and compact slips.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Terms & Exchange Policy (Printed on Invoices & Thermal Slips)
              </label>
              <textarea
                rows={3}
                value={config.terms || ''}
                onChange={(e) => setConfig({ ...config, terms: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition active:scale-98"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Saving to DB...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
