'use client';

import React, { useState, useEffect } from 'react';
import { Printer, ArrowLeft, QrCode } from 'lucide-react';
import { Invoice, ShopConfig } from '@/lib/types';
import { generateProductQRCode } from '@/lib/qr';

interface ThermalReceiptViewProps {
  invoice: Invoice;
  config: ShopConfig;
  initialWidth?: '80mm' | '58mm';
  onBack?: () => void;
}

export default function ThermalReceiptView({
  invoice,
  config,
  initialWidth,
  onBack,
}: ThermalReceiptViewProps) {
  const [selectedWidth, setSelectedWidth] = useState<'80mm' | '58mm'>(
    initialWidth || config.printerWidth || '80mm'
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate verification QR code for first product or invoice
    const primarySku = invoice.items[0]?.productSku;
    if (primarySku) {
      generateProductQRCode(primarySku).then(setQrCodeUrl);
    }
  }, [invoice]);

  const formatPayMode = (mode: string) => {
    switch (mode) {
      case 'CREDIT_CARD': return 'CREDIT CARD';
      case 'DEBIT_CARD': return 'DEBIT CARD';
      case 'UPI': return 'UPI';
      case 'CASH': return 'CASH';
      case 'KHATA': return 'KHATA / CREDIT';
      case 'ADVANCE_ADJUST': return 'ADVANCE ADJUST';
      case 'CARD': return 'CREDIT CARD';
      default: return mode;
    }
  };

  const handlePrint = () => {
    const is58 = selectedWidth === '58mm';
    const headerSize = is58 ? '11px' : '13px';
    const qrSize = is58 ? '70px' : '90px';

    const itemsHtml = invoice.items
      .map(
        (item) => `
        <div style="margin-bottom: 3px;">
          <div style="font-weight: bold; font-size: ${is58 ? '8.5px' : '9.5px'};">${item.productName}</div>
          <div class="flex-between" style="font-size: ${is58 ? '7.5px' : '8.5px'}; color: #333;">
            <span>${item.netWeight}g @ ₹${item.silverRateApplied}/g (Purity: ${item.purity}%)</span>
            <span class="font-bold text-right">₹${item.totalPrice.toFixed(0)}</span>
          </div>
        </div>
      `
      )
      .join('');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${invoice.invoiceNumber}</title>
          <style>
            @page {
              margin: 0;
              size: ${selectedWidth} auto;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: ${is58 ? '9px' : '10.5px'};
              color: #000000;
              margin: 0;
              padding: ${is58 ? '2px 4px' : '4px 8px'};
              line-height: 1.15;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .border-b { border-bottom: 1px dashed #000000; }
            .border-t { border-top: 1px dashed #000000; }
            .border-double { border-top: 2px solid #000000; }
            .py-1 { padding-top: 3px; padding-bottom: 3px; }
            .py-2 { padding-top: 5px; padding-bottom: 5px; }
            .flex-between { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <!-- Store Header -->
          <div class="text-center border-b py-1">
            <div style="font-size: ${headerSize}; font-weight: 900; text-transform: uppercase;">
              ${config.shopName}
            </div>
            ${config.legalName ? `<div style="font-size: 7.5px;">Prop: ${config.legalName}</div>` : ''}
            <div style="font-size: 8px; margin-top: 1px;">${config.address}</div>
            <div style="font-size: 8.5px; font-weight: bold; margin-top: 1px;">Ph: ${config.phone}</div>
            ${config.gstin ? `<div style="font-size: 8.5px;">GSTIN: ${config.gstin}</div>` : ''}
          </div>

          <!-- Bill Meta -->
          <div class="border-b py-1" style="font-size: ${is58 ? '8.5px' : '9.5px'};">
            <div class="flex-between">
              <span class="font-bold">Bill: ${invoice.invoiceNumber}</span>
              <span>${new Date(invoice.date).toLocaleDateString('en-IN')}</span>
            </div>
            <div>Cust: <span class="font-bold">${invoice.customerName}</span></div>
            <div>Mob: ${invoice.customerPhone}</div>
            <div>Pay Mode: <span class="font-bold">${formatPayMode(invoice.paymentMode)}${invoice.paymentStatus !== 'PAID' ? ` (${invoice.paymentStatus})` : ''}</span></div>
          </div>

          <!-- Items Table Header -->
          <div class="border-b py-1 font-bold flex-between" style="font-size: ${is58 ? '8px' : '9.5px'};">
            <span>Item (NW @ Rate)</span>
            <span>Total</span>
          </div>

          <!-- Items List -->
          <div class="py-1">
            ${itemsHtml}
          </div>

          <!-- Calculation Totals -->
          <div class="border-t py-1" style="font-size: ${is58 ? '8.5px' : '10px'};">
            <div class="flex-between">
              <span>Subtotal:</span>
              <span>₹${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${
              invoice.discount > 0
                ? `<div class="flex-between" style="color: #444;">
                    <span>Discount:</span>
                    <span>-₹${invoice.discount.toFixed(2)}</span>
                  </div>`
                : ''
            }
            ${
              invoice.oldSilver && invoice.oldSilver.totalValue > 0
                ? `<div class="flex-between font-bold" style="color: #000;">
                    <span>Old Exch (${invoice.oldSilver.grossWeight}g):</span>
                    <span>-₹${invoice.oldSilver.totalValue.toFixed(2)}</span>
                  </div>`
                : ''
            }
            ${
              invoice.cgst > 0
                ? `<div class="flex-between">
                    <span>CGST (1.5%) + SGST (1.5%):</span>
                    <span>₹${(invoice.cgst + invoice.sgst).toFixed(2)}</span>
                  </div>`
                : ''
            }
            ${
              invoice.cardCharge && invoice.cardCharge > 0
                ? `<div class="flex-between">
                    <span>CC Fee (2.25%):</span>
                    <span>+₹${invoice.cardCharge.toFixed(2)}</span>
                  </div>`
                : ''
            }
            <div class="flex-between font-bold border-double" style="font-size: ${headerSize}; padding-top: 3px; margin-top: 2px;">
              <span>NET TOTAL:</span>
              <span>₹${invoice.grandTotal.toFixed(2)}</span>
            </div>
            ${
              (invoice.dueAmount || 0) > 0
                ? `<div class="flex-between" style="font-weight: bold; margin-top: 2px;">
                    <span>PAID:</span>
                    <span>₹${invoice.paidAmount.toFixed(2)}</span>
                  </div>
                  <div class="flex-between font-bold">
                    <span>DUE BAL:</span>
                    <span>₹${(invoice.dueAmount || 0).toFixed(2)}</span>
                  </div>
                  ${
                    invoice.dueDate
                      ? `<div class="flex-between" style="font-size: 7.5px; color: #444;">
                          <span>PROMISED DATE:</span>
                          <span>${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                        </div>`
                      : ''
                  }`
                : ''
            }
          </div>          </div>

          <!-- QR Code & Footer -->
          <div class="text-center border-t py-2">
            ${
              qrCodeUrl
                ? `<div style="display: flex; justify-content: center; margin-bottom: 2px;">
                    <img src="${qrCodeUrl}" style="width: ${qrSize}; height: ${qrSize}; object-fit: contain;" />
                  </div>
                  <div style="font-size: 7px; font-weight: bold; text-transform: uppercase;">
                    Scan to Verify Hallmark Specs
                  </div>`
                : ''
            }
            <div style="font-size: 8px; font-weight: bold; margin-top: 4px;">
              Thank You! Visit Again
            </div>
            <div style="font-size: 6.5px; color: #555; margin-top: 2px;">
              * Exchange within 3 days against original slip *
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  const is58 = selectedWidth === '58mm';
  const previewWidthClass = is58 ? 'w-[54mm]' : 'w-[76mm]';
  const previewTextSize = is58 ? 'text-[9.5px]' : 'text-[11px]';

  return (
    <div className="min-h-screen bg-slate-900 py-6 px-4 text-slate-100 flex flex-col items-center">
      {/* Top action bar */}
      <div className="w-full max-w-md mb-4 flex flex-wrap items-center justify-between gap-2 no-print bg-slate-800 border border-slate-700 p-3 rounded-2xl shadow-xl">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        {/* Width Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setSelectedWidth('80mm')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              selectedWidth === '80mm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            80mm Standard
          </button>
          <button
            onClick={() => setSelectedWidth('58mm')}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              selectedWidth === '58mm'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            58mm Compact
          </button>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-1.5 rounded-xl shadow-md transition active:scale-98"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print {selectedWidth} Slip</span>
        </button>
      </div>

      {/* Dynamic Thermal Receipt Preview */}
      <div
        className={`bg-white text-black p-3.5 ${previewWidthClass} shadow-2xl rounded-sm font-mono ${previewTextSize} leading-tight border border-slate-300 select-none animate-fade-in`}
      >
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black">
          <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-tight">
            {config.shopName}
          </h2>
          {config.legalName && (
            <p className="text-[8px] text-gray-700">Prop: {config.legalName}</p>
          )}
          <p className="text-[8.5px] mt-0.5 text-gray-800 leading-tight">{config.address}</p>
          <p className="text-[9px] font-bold mt-0.5">Ph: {config.phone}</p>
          {config.gstin && <p className="text-[9px]">GSTIN: {config.gstin}</p>}
        </div>

        {/* Invoice Info */}
        <div className="py-2 border-b border-dashed border-black text-[9.5px] space-y-0.5">
          <div className="flex justify-between">
            <span className="font-bold">Bill: {invoice.invoiceNumber}</span>
            <span>{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
          </div>
          <div>
            Cust: <span className="font-semibold">{invoice.customerName}</span>
          </div>
          <div>Mob: {invoice.customerPhone}</div>
          <div>
            Pay Mode: <span className="font-bold uppercase">{formatPayMode(invoice.paymentMode)}</span>
            {invoice.paymentStatus !== 'PAID' && (
              <span className="ml-1 text-[8px] bg-black text-white px-1 py-0.2 rounded font-bold">
                {invoice.paymentStatus}
              </span>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-2 border-b border-dashed border-black space-y-1.5">
          <div className="flex justify-between font-bold text-[9px] border-b border-dotted pb-0.5">
            <span>Item (NW @ Rate)</span>
            <span>Total</span>
          </div>
          {invoice.items.map((item, idx) => (
            <div key={idx} className="pb-1 border-b border-dotted border-gray-200 last:border-0">
              <div className="font-bold truncate text-[10px]">{item.productName}</div>
              <div className="flex justify-between text-[9px] text-gray-700">
                <span>
                  {item.netWeight}g @ ₹{item.silverRateApplied}/g
                </span>
                <span className="font-bold text-black">₹{item.totalPrice.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Calculations */}
        <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Discount:</span>
              <span>-₹{invoice.discount.toFixed(2)}</span>
            </div>
          )}
          {invoice.oldSilver && invoice.oldSilver.totalValue > 0 && (
            <div className="flex justify-between text-red-700 font-semibold">
              <span>Old Exch ({invoice.oldSilver.grossWeight}g):</span>
              <span>-₹{invoice.oldSilver.totalValue.toFixed(2)}</span>
            </div>
          )}
          {invoice.cgst > 0 && (
            <div className="flex justify-between">
              <span>GST (3%):</span>
              <span>₹{(invoice.cgst + invoice.sgst).toFixed(2)}</span>
            </div>
          )}
          {invoice.cardCharge && invoice.cardCharge > 0 && (
            <div className="flex justify-between text-blue-900 font-semibold">
              <span>CC Fee (2.25%):</span>
              <span>+₹{invoice.cardCharge.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-xs sm:text-sm pt-1.5 border-t-2 border-black">
            <span>NET TOTAL:</span>
            <span>₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
          {(invoice.dueAmount || 0) > 0 && (
            <div className="pt-1.5 border-t border-dotted border-gray-400 space-y-0.5 text-[9.5px]">
              <div className="flex justify-between font-bold">
                <span>PAID NOW:</span>
                <span>₹{invoice.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-red-700">
                <span>BALANCE DUE:</span>
                <span>₹{(invoice.dueAmount || 0).toFixed(2)}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex justify-between text-[8px] text-gray-600">
                  <span>PROMISED DATE:</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR Code & Footer */}
        <div className="text-center pt-2.5 space-y-1">
          {qrCodeUrl && (
            <div className="flex flex-col items-center">
              <img src={qrCodeUrl} alt="Hallmark QR" className="w-14 h-14 object-contain" />
              <span className="text-[7px] font-bold text-gray-700 uppercase">
                Scan to Verify Hallmark Specs
              </span>
            </div>
          )}
          <p className="font-bold text-[9.5px]">Thank You! Visit Again</p>
          <p className="text-[7px] text-gray-500">* Exchange within 3 days against invoice *</p>
        </div>
      </div>
    </div>
  );
}
