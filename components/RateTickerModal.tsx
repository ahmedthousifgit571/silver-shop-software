'use client';

import React, { useState } from 'react';
import { X, TrendingUp, RefreshCw, CheckCircle2, ShieldCheck, Coins } from 'lucide-react';
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/90 w-full max-w-md rounded-2xl p-6 shadow-modal relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/70 shadow-2xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Today&apos;s Silver Rates</h2>
            <p className="text-xs text-slate-500">
              Live rate card (₹/g) applied automatically to all billing and stock valuations.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                999 Fine Silver (₹/g)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.fineRate999}
                onChange={(e) =>
                  setFormData({ ...formData, fineRate999: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                925 Sterling (₹/g)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.sterlingRate925}
                onChange={(e) =>
                  setFormData({ ...formData, sterlingRate925: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                800 Utensil (₹/g)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.utensilRate800}
                onChange={(e) =>
                  setFormData({ ...formData, utensilRate800: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Old Silver Buyback (₹/g)
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={formData.scrapRateBuyback}
                onChange={(e) =>
                  setFormData({ ...formData, scrapRateBuyback: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

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
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-blue-500/20 transition active:scale-98"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Rates Updated!</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Save Rates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
