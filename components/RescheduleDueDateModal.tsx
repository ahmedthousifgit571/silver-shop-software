'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Invoice } from '@/lib/types';

interface RescheduleDueDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSaveDueDate: (invoiceNumber: string, newDueDate: string) => Promise<void> | void;
}

export default function RescheduleDueDateModal({
  isOpen,
  onClose,
  invoice,
  onSaveDueDate,
}: RescheduleDueDateModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      if (invoice.dueDate) {
        setSelectedDate(new Date(invoice.dueDate).toISOString().split('T')[0]);
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setSelectedDate(d.toISOString().split('T')[0]);
      }
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const setPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    setIsSaving(true);
    try {
      await onSaveDueDate(invoice.invoiceNumber, selectedDate);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200/90 w-full max-w-md rounded-2xl p-5 sm:p-6 shadow-modal relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/70 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Update Promised Repayment Date</h2>
            <p className="text-xs text-slate-500">
              {invoice.customerName} • Bill #{invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Bill Summary Strip */}
        <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/70 mb-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Outstanding Balance Due</span>
            <span className="text-sm font-bold text-rose-700 font-mono">
              ₹{(invoice.dueAmount || 0).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Current Repayment Date</span>
            <span className="text-xs font-semibold text-slate-800 font-mono">
              {invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not Set'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                New Promised Date *
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreset(0)}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[10px] transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(7)}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[10px] transition"
                >
                  +7d
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(15)}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[10px] transition"
                >
                  +15d
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(30)}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[10px] transition"
                >
                  +30d
                </button>
              </div>
            </div>

            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
            />
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
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs shadow-xs transition active:scale-98 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Update Repayment Date'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
