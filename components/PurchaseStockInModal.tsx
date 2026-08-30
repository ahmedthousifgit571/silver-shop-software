'use client';

import React, { useState, useEffect } from 'react';
import { X, PackagePlus, CheckCircle2, Building, Scale, DollarSign, Calendar } from 'lucide-react';
import { Product, PurchaseStockIn } from '@/lib/types';

interface PurchaseStockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSavePurchase: (purchase: PurchaseStockIn) => void;
}

export default function PurchaseStockInModal({
  isOpen,
  onClose,
  products,
  onSavePurchase,
}: PurchaseStockInModalProps) {
  const [selectedSku, setSelectedSku] = useState(products[0]?.sku || '');
  const [vendorName, setVendorName] = useState('Sri Balaji Silver Refiners');
  const [quantity, setQuantity] = useState(5);
  const [weightGrams, setWeightGrams] = useState(50.0);
  const [purity, setPurity] = useState(92.5);
  const [purchaseRatePerGram, setPurchaseRatePerGram] = useState(72.0);
  const [invoiceRef, setInvoiceRef] = useState('');
  const [notes, setNotes] = useState('New hallmark inward batch');

  useEffect(() => {
    if (products.length > 0 && !selectedSku) {
      setSelectedSku(products[0].sku);
      setWeightGrams(products[0].netWeight * 5);
      setPurity(products[0].purity);
      setPurchaseRatePerGram(products[0].purchaseRatePerGram || 72.0);
    }
  }, [products]);

  const handleProductSelect = (sku: string) => {
    setSelectedSku(sku);
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      setWeightGrams(prod.netWeight * quantity);
      setPurity(prod.purity);
      setPurchaseRatePerGram(prod.purchaseRatePerGram || 72.0);
    }
  };

  const totalCost = weightGrams * purchaseRatePerGram;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.sku === selectedSku);
    const purchaseData: PurchaseStockIn = {
      id: `pur-${Date.now()}`,
      vendorName: vendorName.trim(),
      date: new Date().toISOString(),
      productSku: selectedSku,
      productName: prod ? prod.name : 'Silver Item',
      quantity: Number(quantity),
      weightGrams: Number(weightGrams),
      purity: Number(purity),
      purchaseRatePerGram: Number(purchaseRatePerGram),
      totalCost,
      invoiceRef: invoiceRef.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSavePurchase(purchaseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 shadow-modal relative text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Stock In / Purchase Entry</h2>
            <p className="text-xs text-slate-500">
              Record new arrival from silversmith or artisan to increase stock.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vendor / Silversmith / Karigar Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sri Balaji Refiners / Ramesh Karigar"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product to Restock *
            </label>
            <select
              value={selectedSku}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.sku} value={p.sku}>
                  {p.name} ({p.sku}) - In Stock: {p.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Qty (Pcs) *</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => {
                  const q = parseInt(e.target.value) || 1;
                  setQuantity(q);
                  const prod = products.find((p) => p.sku === selectedSku);
                  if (prod) setWeightGrams(prod.netWeight * q);
                }}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Total Wt (g) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Purity (%)</label>
              <input
                type="number"
                step="0.1"
                value={purity}
                onChange={(e) => setPurity(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purchase Rate (₹ / gram) *
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={purchaseRatePerGram}
                onChange={(e) => setPurchaseRatePerGram(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vendor Bill / DC Ref
              </label>
              <input
                type="text"
                placeholder="e.g. DC-4091"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-emerald-900 font-medium">Total Inward Cost:</span>
            <span className="text-base font-bold text-emerald-900 font-mono">
              ₹{totalCost.toFixed(2)}
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
              <span>Record Purchase & Add Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
