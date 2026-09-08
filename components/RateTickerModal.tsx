'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingUp, CheckCircle2, Coins, Sparkles, Eye, Plus, Minus } from 'lucide-react';
import { SilverRates } from '@/lib/types';

interface RateTickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  rates: SilverRates;
  onSaveRates: (newRates: SilverRates) => void;
}

export default function RateTickerModal({
  isOpen,
  onClose,
  rates,
  onSaveRates,
}: RateTickerModalProps) {
  const [formData, setFormData] = useState<SilverRates>({ ...rates });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fineRate999: rates.fineRate999 ?? 96.0,
        sterlingRate925: rates.sterlingRate925 ?? 89.0,
        utensilRate800: rates.utensilRate800 ?? 77.0,
        goldRate916: rates.goldRate916 ?? 7150.0,
        scrapRateBuyback: rates.scrapRateBuyback ?? 81.0,
        displayShowcase: rates.displayShowcase || '925',
        lastUpdated: rates.lastUpdated || new Date().toISOString(),
      });
    }
  }, [isOpen, rates]);

  if (!isOpen) return null;

  const handleQuickAdjust = (field: keyof SilverRates, delta: number) => {
    const currentVal = Number(formData[field]) || 0;
    const newVal = Math.max(0, Math.round((currentVal + delta) * 10) / 10);
    setFormData((prev) => ({ ...prev, [field]: newVal }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRates({
      ...formData,
      lastUpdated: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  const showcaseOptions = [
    { key: '925', label: '925 Sterling', sub: `₹${formData.sterlingRate925}/g` },
    { key: '999', label: '999 Fine', sub: `₹${formData.fineRate999}/g` },
    { key: '800', label: '800 Utensil', sub: `₹${formData.utensilRate800}/g` },
    { key: '916', label: '22K Gold', sub: `₹${formData.goldRate916}/g` },
    { key: 'ALL', label: '925 & 999 Combined', sub: `₹${formData.sterlingRate925} | ₹${formData.fineRate999}` },
  ];

  const sanitizePositiveRate = (val: string): number => {
    const cleaned = val.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
    return cleaned === '' ? 0 : parseFloat(cleaned) || 0;
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/90 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-modal relative text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/70 shadow-2xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Custom Metal Rates Card</h2>
            <p className="text-xs text-slate-500">
              Set store rates (₹/g) and choose which rate is showcased on the top header & dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Rate Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 925 Sterling */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-900">
                  925 Sterling Silver (₹/g)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('sterlingRate925', -1)}
                    className="p-1 text-slate-500 hover:bg-amber-100 rounded text-[10px] font-bold"
                    title="-₹1"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('sterlingRate925', 1)}
                    className="p-1 text-slate-500 hover:bg-amber-100 rounded text-[10px] font-bold"
                    title="+₹1"
                  >
                    +1
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="0.0"
                value={formData.sterlingRate925 === 0 ? '' : formData.sterlingRate925}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  setFormData({ ...formData, sterlingRate925: sanitizePositiveRate(e.target.value) })
                }
                className="w-full bg-white border border-amber-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-1.5 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            {/* 999 Fine */}
            <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-sky-900">
                  999 Fine Silver (₹/g)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('fineRate999', -1)}
                    className="p-1 text-slate-500 hover:bg-sky-100 rounded text-[10px] font-bold"
                    title="-₹1"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('fineRate999', 1)}
                    className="p-1 text-slate-500 hover:bg-sky-100 rounded text-[10px] font-bold"
                    title="+₹1"
                  >
                    +1
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="0.0"
                value={formData.fineRate999 === 0 ? '' : formData.fineRate999}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  setFormData({ ...formData, fineRate999: sanitizePositiveRate(e.target.value) })
                }
                className="w-full bg-white border border-sky-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-1.5 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            {/* 800 Utensil */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-emerald-900">
                  800 Silver / Utensil (₹/g)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('utensilRate800', -1)}
                    className="p-1 text-slate-500 hover:bg-emerald-100 rounded text-[10px] font-bold"
                    title="-₹1"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('utensilRate800', 1)}
                    className="p-1 text-slate-500 hover:bg-emerald-100 rounded text-[10px] font-bold"
                    title="+₹1"
                  >
                    +1
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="0.0"
                value={formData.utensilRate800 === 0 ? '' : formData.utensilRate800}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  setFormData({ ...formData, utensilRate800: sanitizePositiveRate(e.target.value) })
                }
                className="w-full bg-white border border-emerald-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-1.5 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            {/* Old Silver Scrap Buyback */}
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-rose-900">
                  Old Silver Buyback (₹/g)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('scrapRateBuyback', -1)}
                    className="p-1 text-slate-500 hover:bg-rose-100 rounded text-[10px] font-bold"
                    title="-₹1"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('scrapRateBuyback', 1)}
                    className="p-1 text-slate-500 hover:bg-rose-100 rounded text-[10px] font-bold"
                    title="+₹1"
                  >
                    +1
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="0.0"
                value={formData.scrapRateBuyback === 0 ? '' : formData.scrapRateBuyback}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  setFormData({ ...formData, scrapRateBuyback: sanitizePositiveRate(e.target.value) })
                }
                className="w-full bg-white border border-rose-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-1.5 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            {/* 916 22K Gold (Optional / Additional) */}
            <div className="sm:col-span-2 p-3 bg-amber-500/10 rounded-xl border border-amber-300/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>916 (22K) Gold Rate (₹/g)</span>
                  <span className="text-[10px] font-normal text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Optional</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('goldRate916', -50)}
                    className="p-1 text-slate-600 hover:bg-amber-200/60 rounded text-[10px] font-bold"
                    title="-₹50"
                  >
                    -50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust('goldRate916', 50)}
                    className="p-1 text-slate-600 hover:bg-amber-200/60 rounded text-[10px] font-bold"
                    title="+₹50"
                  >
                    +50
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={formData.goldRate916 === 0 ? '' : (formData.goldRate916 || 7150)}
                onKeyDown={handleNumericKeyDown}
                onChange={(e) =>
                  setFormData({ ...formData, goldRate916: sanitizePositiveRate(e.target.value) })
                }
                className="w-full bg-white border border-amber-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-1.5 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Header Showcase Selector */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Choose Rate to Showcase on Top Header</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Select which rate or combination appears in the top-right header badge next to &quot;New Bill&quot;.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {showcaseOptions.map((opt) => {
                const isSelected = (formData.displayShowcase || '925') === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, displayShowcase: opt.key })}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 text-blue-900 shadow-2xs ring-2 ring-blue-500/20'
                        : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{opt.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 block mt-0.5 font-medium">
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition active:scale-98"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Rates Updated!</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Save & Apply Rates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
