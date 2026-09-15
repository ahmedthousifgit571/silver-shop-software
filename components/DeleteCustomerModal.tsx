'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, User, Phone, MapPin } from 'lucide-react';
import { Customer } from '@/lib/types';

interface DeleteCustomerModalProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onConfirmDelete: (customer: Customer) => Promise<void> | void;
}

export default function DeleteCustomerModal({
  isOpen,
  customer,
  onClose,
  onConfirmDelete,
}: DeleteCustomerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete(customer);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete customer. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasDue = (customer.outstandingBalance || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-modal overflow-hidden text-slate-900 relative">
        {/* Top Warning Stripe */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 w-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Header Icon + Title */}
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-200/80 shadow-xs flex-shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Permanently Delete Customer?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This action will permanently remove this customer profile from your CRM.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Summary Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {customer.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {customer.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono block">
                  +91 {customer.phone}
                </span>
                {customer.address && (
                  <span className="text-[10px] text-slate-400 block truncate">
                    {customer.address}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Spend</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  ₹{Number(customer.totalSpend || 0).toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Bills</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  {customer.totalBills || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Due Balance</span>
                <span
                  className={`font-bold font-mono text-[11px] ${
                    hasDue ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  ₹{Number(customer.outstandingBalance || 0).toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Notice Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Customer Record Deletion</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              The customer profile and associated khata entries will be deleted. Any past sales invoices
              and turnover reports will remain completely preserved.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs shadow-rose-500/20 transition active:scale-98"
            >
              {isDeleting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
