'use client';

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Product } from '@/lib/types';

interface DeleteProductModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmDelete: (product: Product) => Promise<void> | void;
}

export default function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onConfirmDelete,
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete(product);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

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
                Permanently Delete Product?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                This action is irreversible and will permanently remove this item.
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

          {/* Product Summary Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-3">
              <img
                src={
                  product.imageUrl ||
                  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
                }
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200/90 flex-shrink-0 shadow-2xs"
              />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-slate-900 block truncate">
                  {product.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">
                  SKU: <strong className="text-slate-700">{product.sku}</strong> • {product.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Purity</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  {product.purity}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Net Weight</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  {product.netWeight?.toFixed(2)}g
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">In Stock</span>
                <span className="font-bold text-slate-900 font-mono text-[11px]">
                  {product.stockQuantity} pcs
                </span>
              </div>
            </div>
          </div>

          {/* Warning Notice Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Hard Delete Confirmation</span>
            </div>
            <p className="text-[11px] text-amber-700 leading-relaxed">
              The product and its QR code will be erased from the database. Any past invoice history
              will be preserved cleanly.
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
