'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Store, Printer, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ShopConfig } from '@/lib/types';
import { initialShopConfig } from '@/lib/storage';

export default function SettingsPage() {
  const [config, setConfig] = useState<ShopConfig>(initialShopConfig);
  const [printerWidth, setPrinterWidth] = useState<'80mm' | '58mm'>('80mm');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

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

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6">
        {/* Store Profile Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Store Profile & Tax Registration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Name *
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                value={config.gstin}
                onChange={(e) => setConfig({ ...config, gstin: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none uppercase"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shop Address (Printed on Bills)
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Printing & Thermal Setup Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Printer & Invoice Terms</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                POS Receipt Width
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <input
                    type="radio"
                    name="printerWidth"
                    checked={printerWidth === '80mm'}
                    onChange={() => setPrinterWidth('80mm')}
                  />
                  <span className="font-semibold text-slate-800">80mm Standard POS Roll</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 p-3 rounded-xl">
                  <input
                    type="radio"
                    name="printerWidth"
                    checked={printerWidth === '58mm'}
                    onChange={() => setPrinterWidth('58mm')}
                  />
                  <span className="font-semibold text-slate-800">58mm Compact Roll</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Terms & Exchange Policy
              </label>
              <textarea
                rows={3}
                value={config.terms}
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition active:scale-98"
          >
            {isSaved && <CheckCircle2 className="w-4 h-4 text-white" />}
            <span>{isSaved ? 'Settings Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
