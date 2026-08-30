'use client';

import React, { useState } from 'react';
import { X, Boxes, Plus, Minus, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Product } from '@/lib/types';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (productId: string, newQuantity: number) => void;
}

export default function StockAdjustmentModal({
  product,
  isOpen,
  onClose,
  onUpdateStock,
}: StockAdjustmentModalProps) {
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [actionType, setActionType] = useState<'ADD' | 'SET' | 'SUB'>('ADD');
  const [reason, setReason] = useState('New batch arrival from Karigar');

  if (!isOpen || !product) return null;

  const calculateNewQuantity = () => {
    if (actionType === 'ADD') return product.stockQuantity + adjustQty;
    if (actionType === 'SUB') return Math.max(0, product.stockQuantity - adjustQty);
    return adjustQty;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newQty = calculateNewQuantity();
    onUpdateStock(product.id, newQty);
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
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Adjust Product Stock</h2>
            <p className="text-xs text-slate-500 truncate max-w-[240px]">
              {product.name} ({product.sku})
            </p>
          </div>
        </div>

        {/* Current Stock */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between mb-4 text-xs">
          <span className="text-slate-500">Current In-Store Stock:</span>
          <span className="text-base font-bold text-slate-900 font-mono">
            {product.stockQuantity} pcs
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType('ADD')}
                className={`py-2 rounded-xl text-xs font-semibold transition border ${
                  actionType === 'ADD'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                + Add Stock
              </button>
              <button
                type="button"
                onClick={() => setActionType('SUB')}
                className={`py-2 rounded-xl text-xs font-semibold transition border ${
                  actionType === 'SUB'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                - Deduct Stock
              </button>
              <button
                type="button"
                onClick={() => setActionType('SET')}
                className={`py-2 rounded-xl text-xs font-semibold transition border ${
                  actionType === 'SET'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                = Set Exact
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {actionType === 'SET' ? 'New Exact Stock' : 'Quantity to Adjust'} (Pcs) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-600">Resulting Stock Count:</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {calculateNewQuantity()} pcs
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
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
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
