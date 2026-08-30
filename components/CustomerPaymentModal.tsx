'use client';

import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Customer, KhataTransaction } from '@/lib/types';

interface CustomerPaymentModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordTransaction: (tx: KhataTransaction) => void;
}

export default function CustomerPaymentModal({
  customer,
  isOpen,
  onClose,
  onRecordTransaction,
}: CustomerPaymentModalProps) {
  const [type, setType] = useState<'PAYMENT_CREDIT' | 'ADVANCE_DEPOSIT'>('PAYMENT_CREDIT');
  const [amount, setAmount] = useState<number>(customer?.outstandingBalance || 1000);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [notes, setNotes] = useState('Payment received');

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tx: KhataTransaction = {
      id: `tx-${Date.now()}`,
      customerId: customer.id,
      date: new Date().toISOString(),
      type,
      amount: Number(amount),
      paymentMode,
      notes: notes.trim() || undefined,
    };
    onRecordTransaction(tx);
    onClose();
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
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Record Khata Transaction</h2>
            <p className="text-xs text-slate-500">{customer.name} (+91 {customer.phone})</p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Outstanding Balance</span>
            <span className="text-sm font-bold text-rose-600 font-mono">
              ₹{customer.outstandingBalance.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Advance Balance</span>
            <span className="text-sm font-bold text-emerald-700 font-mono">
              ₹{customer.advanceBalance.toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Purpose
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('PAYMENT_CREDIT')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 border ${
                  type === 'PAYMENT_CREDIT'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Settle Due / Credit</span>
              </button>

              <button
                type="button"
                onClick={() => setType('ADVANCE_DEPOSIT')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 border ${
                  type === 'ADVANCE_DEPOSIT'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Advance Deposit</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none"
            />
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
              placeholder="e.g. Settle bill balance / Advance payment"
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
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-xs transition active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Update Khata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
