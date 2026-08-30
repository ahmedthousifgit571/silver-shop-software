'use client';

import React from 'react';
import { QrCode, Plus, Edit2, AlertTriangle, CheckCircle2, Scale, RefreshCw } from 'lucide-react';
import { Product, SilverRates } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  rates: SilverRates;
  onOpenQRTag: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onRestock: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({
  product,
  rates,
  onOpenQRTag,
  onEditProduct,
  onRestock,
  onAddToCart,
}: ProductCardProps) {
  let applicableRate = rates.sterlingRate925;
  if (product.purity >= 99) {
    applicableRate = rates.fineRate999;
  } else if (product.purity <= 85) {
    applicableRate = rates.utensilRate800;
  }

  const metalValue = product.netWeight * applicableRate;
  let making = 0;
  if (product.makingChargeType === 'PER_GRAM') {
    making = product.netWeight * product.makingChargeValue;
  } else if (product.makingChargeType === 'FLAT') {
    making = product.makingChargeValue;
  } else if (product.makingChargeType === 'PERCENT') {
    making = metalValue * (product.makingChargeValue / 100);
  }
  const estimatedPrice = metalValue + making;

  const isLowStock = product.stockQuantity <= product.minStockAlert && product.stockQuantity > 0;
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200/80 shadow-card hover:shadow-card-hover transition">
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden group">
        <img
          src={
            product.imageUrl ||
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Purity Badge */}
        <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
          {product.purity}% ({product.purityGrade?.split(' ')[0]})
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-rose-200">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200">
              Low ({product.stockQuantity})
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
              {product.stockQuantity} in stock
            </span>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
            <span>{product.sku}</span>
            <span className="text-slate-500">{product.category}</span>
          </div>

          <h3 className="font-bold text-sm text-slate-900 line-clamp-1 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Weight & Price Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Net Weight</span>
            <span className="font-bold text-slate-900 font-mono">
              {product.netWeight.toFixed(2)} g
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Est. Price</span>
            <span className="font-bold text-slate-900 font-mono">
              ₹{estimatedPrice.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => onOpenQRTag(product)}
            className="flex items-center justify-center gap-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
            title="Print QR Sticker Tag"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tag</span>
          </button>

          <button
            onClick={() => onEditProduct(product)}
            className="flex items-center justify-center gap-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
            title="Edit Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onRestock(product)}
            className="flex items-center justify-center gap-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition"
            title="Adjust Stock"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Stock</span>
          </button>
        </div>
      </div>
    </div>
  );
}
