'use client';

import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import { Invoice, ShopConfig } from '@/lib/types';

interface ThermalReceiptViewProps {
  invoice: Invoice;
  config: ShopConfig;
  onBack?: () => void;
}

export default function ThermalReceiptView({
  invoice,
  config,
  onBack,
}: ThermalReceiptViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 py-6 px-4 text-slate-100 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between no-print bg-slate-900 border border-slate-800 p-3 rounded-xl">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg"
        >
          <Printer className="w-3.5 h-3.5" /> Print 80mm Slip
        </button>
      </div>

      {/* 80mm Thermal Receipt Structure */}
      <div className="bg-white text-black p-4 w-[76mm] shadow-2xl rounded font-mono text-[11px] leading-tight border border-slate-300">
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="font-bold text-sm uppercase">{config.shopName}</h2>
          <p className="text-[10px]">{config.address}</p>
          <p className="text-[10px]">Ph: {config.phone}</p>
          <p className="text-[10px]">GSTIN: {config.gstin || 'N/A'}</p>
        </div>

        {/* Invoice Info */}
        <div className="py-2 border-b border-dashed border-black text-[10px]">
          <div className="flex justify-between">
            <span>Bill: {invoice.invoiceNumber}</span>
            <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
          </div>
          <div>Cust: {invoice.customerName} ({invoice.customerPhone})</div>
          <div>Mode: {invoice.paymentMode}</div>
        </div>

        {/* Items Table */}
        <div className="py-2 border-b border-dashed border-black">
          <div className="flex justify-between font-bold text-[10px] mb-1">
            <span>Item (NW)</span>
            <span>Total</span>
          </div>
          {invoice.items.map((item, idx) => (
            <div key={idx} className="mb-1">
              <div className="font-semibold truncate">{item.productName}</div>
              <div className="flex justify-between text-[10px] text-gray-700">
                <span>
                  {item.netWeight}g @ ₹{item.silverRateApplied}/g
                </span>
                <span className="font-bold text-black">₹{item.totalPrice.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Calculations */}
        <div className="py-2 border-b border-dashed border-black space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-₹{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          {invoice.oldSilver && invoice.oldSilver.totalValue > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Old Exch ({invoice.oldSilver.grossWeight}g):</span>
              <span>-₹{invoice.oldSilver.totalValue.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST (3%):</span>
            <span>₹{(invoice.cgst + invoice.sgst).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
            <span>NET TOTAL:</span>
            <span>₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-[9px]">
          <p>Scan QR code on bill for purity & live stock</p>
          <p className="font-bold mt-1">Thank You! Visit Again</p>
        </div>
      </div>
    </div>
  );
}
