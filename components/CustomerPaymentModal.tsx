'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Wallet, Receipt } from 'lucide-react';
import { Customer, KhataTransaction } from '@/lib/types';

interface CustomerPaymentModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordTransaction: (tx: KhataTransaction) => void;
  initialAmount?: number;
  invoiceRef?: string;
}

export default function CustomerPaymentModal({
  customer,
  isOpen,
  onClose,
  onRecordTransaction,
  initialAmount,
  invoiceRef,
}: CustomerPaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [notes, setNotes] = useState('Payment received');

  React.useEffect(() => {
    if (isOpen && customer) {
      const defaultAmt = initialAmount !== undefined ? initialAmount : (customer.outstandingBalance || 0);
      setAmount(defaultAmt);
      setNotes(invoiceRef ? `Settlement for Bill #${invoiceRef}` : 'Credit payment received');
    }
  }, [isOpen, customer, initialAmount, invoiceRef]);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: KhataTransaction = {
      id: `tx-${Date.now()}`,
      customerId: customer.id,
      date: new Date().toISOString(),
      type: 'PAYMENT_CREDIT',
      amount: Number(amount),
      paymentMode,
      referenceInvoice: invoiceRef || undefined,
      notes: notes.trim() || undefined,
    };
    onRecordTransaction(tx);
    onClose();
  };

  const outstandingDue = initialAmount !== undefined ? initialAmount : (customer.outstandingBalance || 0);

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
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200/60">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Settle Outstanding Due</h2>
            <p className="text-xs text-slate-500">{customer.name} (+91 {customer.phone})</p>
          </div>
        </div>

        {/* Current Balance / Bill Reference */}
        <div className="bg-rose-50/60 border border-rose-200/70 p-3.5 rounded-xl mb-4 flex items-center justify-between">
          <div>
            <span className="text-rose-900/80 block text-[11px] font-medium">
              {invoiceRef ? `Bill #${invoiceRef} Outstanding` : 'Total Account Outstanding'}
            </span>
            <div className="text-lg font-bold text-rose-600 font-mono mt-0.5">
              ₹{outstandingDue.toFixed(2)}
            </div>
          </div>
          {invoiceRef && (
            <span className="text-[10px] font-mono font-bold bg-white text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs">
              {invoiceRef}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount to Settle (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
              value={amount === 0 ? '' : amount}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') e.preventDefault();
              }}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, '');
                setAmount(cleaned === '' ? 0 : parseFloat(cleaned) || 0);
              }}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-base text-slate-900 font-mono font-bold focus:outline-none transition"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Enter full amount (₹{outstandingDue.toFixed(2)}) or a partial settlement amount.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none"
            >
              <option value="UPI">UPI (GPay / PhonePe / QR)</option>
              <option value="CASH">Cash in Drawer</option>
              <option value="BANK">Bank Transfer / NEFT</option>
              <option value="CARD">Debit / Credit Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Narration</label>
            <input
              type="text"
              placeholder="e.g. Settle bill balance"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs shadow-emerald-600/20 transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Settle & Update Khata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
