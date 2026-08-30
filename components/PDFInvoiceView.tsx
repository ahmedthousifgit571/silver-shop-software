'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Download, Share2, ArrowLeft, QrCode, Sparkles, Check, FileText } from 'lucide-react';
import { Invoice, ShopConfig } from '@/lib/types';
import { generateProductQRCode } from '@/lib/qr';
import { generateInvoicePDF } from '@/lib/pdf';

interface PDFInvoiceViewProps {
  invoice: Invoice;
  config: ShopConfig;
  onBack?: () => void;
}

export default function PDFInvoiceView({ invoice, config, onBack }: PDFInvoiceViewProps) {
  const [itemQRs, setItemQRs] = useState<{ [sku: string]: string }>({});

  useEffect(() => {
    const generateAll = async () => {
      const qrs: { [sku: string]: string } = {};
      for (const item of invoice.items) {
        if (!qrs[item.productSku]) {
          qrs[item.productSku] = await generateProductQRCode(item.productSku);
        }
      }
      setItemQRs(qrs);
    };
    generateAll();
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const doc = await generateInvoicePDF(invoice, config);
    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const handleWhatsAppShare = () => {
    const itemsList = invoice.items
      .map((i) => `• ${i.productName} (NW: ${i.netWeight}g) - ₹${i.totalPrice.toFixed(0)}`)
      .join('\n');

    const billTitle =
      invoice.invoiceType === 'ESTIMATE_QUOTATION'
        ? 'ESTIMATE / QUOTATION'
        : invoice.invoiceType === 'NON_GST_BILL'
        ? 'RETAIL CASH MEMO'
        : 'TAX INVOICE';

    const message = `✨ *${config.shopName}* ✨\n*${billTitle}: ${invoice.invoiceNumber}*\nDate: ${new Date(
      invoice.date
    ).toLocaleDateString('en-IN')}\nCustomer: ${invoice.customerName}\n\n*Items:*\n${itemsList}\n\n*Grand Total: ₹${invoice.grandTotal.toFixed(
      2
    )}* (${invoice.paymentMode})\n\n🔍 *Verify product purity & live stock anytime:* Scan the QR code on your bill!\n\nThank you! Visit again.`;

    const waUrl = `https://api.whatsapp.com/send?phone=91${invoice.customerPhone.replace(
      /\D/g,
      ''
    )}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const getHeaderBadge = () => {
    if (invoice.invoiceType === 'ESTIMATE_QUOTATION') {
      return { text: 'ESTIMATE / QUOTATION', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    if (invoice.invoiceType === 'NON_GST_BILL') {
      return { text: 'RETAIL CASH MEMO', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { text: 'GST TAX INVOICE', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const badge = getHeaderBadge();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 py-6 px-4">
      {/* Top Action Bar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print bg-white border border-slate-200 p-4 rounded-2xl shadow-card">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to POS</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</span>
          <span>•</span>
          <span className="font-semibold text-slate-800">{badge.text}</span>
          <span>•</span>
          <span>Billed to {invoice.customerName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-xs transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill</span>
          </button>
        </div>
      </div>

      {/* Printable A4 Tax Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-card p-8 sm:p-12 border border-slate-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-200 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {config.shopName}
            </h1>
            <p className="text-xs font-medium text-slate-600 mt-1">{config.tagline}</p>
            <p className="text-xs text-slate-600 mt-0.5">{config.address}</p>
            <p className="text-xs text-slate-600">
              Phone: <span className="font-semibold text-slate-800">{config.phone}</span>
              {invoice.invoiceType === 'TAX_INVOICE' && (
                <> | GSTIN: <span className="font-semibold text-slate-800">{config.gstin || 'N/A'}</span></>
              )}
            </p>
          </div>

          <div className="sm:text-right">
            <div className={`inline-block font-bold text-xs px-3 py-0.5 rounded-full uppercase tracking-wider mb-2 border ${badge.bg}`}>
              {badge.text}
            </div>
            <div className="text-xs font-mono font-bold text-slate-800">
              Bill #{invoice.invoiceNumber}
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-medium">
              Date: {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">
              Payment: <span className="font-bold text-slate-800">{invoice.paymentMode}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Customer Details:
            </span>
            <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
            <div className="text-slate-600 font-mono">Mobile: +91 {invoice.customerPhone}</div>
            {invoice.customerAddress && (
              <div className="text-slate-500 mt-0.5">{invoice.customerAddress}</div>
            )}
          </div>
          <div className="sm:text-right">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              HSN & Taxation:
            </span>
            <div className="text-slate-600">HSN Code: <span className="font-semibold text-slate-900">{config.hsnCode || '7113'}</span></div>
            <div className="text-slate-600">
              Regime: {invoice.invoiceType === 'TAX_INVOICE' ? 'GST 3% (Precious Metals)' : 'Non-GST Retail Memo'}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Product Description & QR</th>
                <th className="py-3 px-2 text-right">Gross Wt</th>
                <th className="py-3 px-2 text-right">Net Wt</th>
                <th className="py-3 px-2 text-right">Purity</th>
                <th className="py-3 px-2 text-right">Rate/g</th>
                <th className="py-3 px-2 text-right">Wastage</th>
                <th className="py-3 px-2 text-right">Making</th>
                <th className="py-3 px-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => {
                const qr = itemQRs[item.productSku];
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-2 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-start gap-3">
                        {qr && (
                          <img
                            src={qr}
                            alt="Item QR"
                            className="w-12 h-12 object-contain border border-slate-200 rounded p-0.5 flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block">{item.productName}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            SKU: {item.productSku} | HSN: {item.hsnCode || '7113'}
                          </span>
                          <span className="text-[9px] text-blue-600 font-semibold block mt-0.5">
                            Scan on mobile for live stock & specs
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-slate-700">
                      {item.grossWeight.toFixed(2)} g
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">
                      {item.netWeight.toFixed(2)} g
                    </td>
                    <td className="py-3 px-2 text-right text-slate-700">{item.purity}%</td>
                    <td className="py-3 px-2 text-right text-slate-700">
                      ₹{item.silverRateApplied.toFixed(1)}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-700">
                      ₹{(item.wastageAmount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-slate-700">
                      ₹{item.makingCharge.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-950 font-mono">
                      ₹{item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl flex-shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-[11px] text-slate-600">
              <span className="font-bold text-slate-900 block mb-0.5">
                Instant Smartphone Verification
              </span>
              Scan any QR code on this invoice with your phone camera to check product purity certificate, hallmark details, and store live stock without login.
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 font-medium">
            <div className="flex justify-between py-0.5">
              <span>Item Subtotal:</span>
              <span className="font-bold font-mono">₹{invoice.subtotal.toFixed(2)}</span>
            </div>

            {invoice.wastageTotal > 0 && (
              <div className="flex justify-between py-0.5 text-slate-600">
                <span>Total Wastage:</span>
                <span className="font-mono">₹{invoice.wastageTotal.toFixed(2)}</span>
              </div>
            )}

            {invoice.makingCharges > 0 && (
              <div className="flex justify-between py-0.5 text-slate-600">
                <span>Total Making Charges:</span>
                <span className="font-mono">₹{invoice.makingCharges.toFixed(2)}</span>
              </div>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between py-0.5 text-emerald-700 font-bold">
                <span>Special Discount:</span>
                <span className="font-mono">- ₹{invoice.discount.toFixed(2)}</span>
              </div>
            )}

            {invoice.oldSilver && invoice.oldSilver.totalValue > 0 && (
              <div className="flex justify-between py-0.5 text-rose-600 font-bold">
                <span>Old Silver Credit ({invoice.oldSilver.grossWeight}g):</span>
                <span className="font-mono">- ₹{invoice.oldSilver.totalValue.toFixed(2)}</span>
              </div>
            )}

            {invoice.invoiceType === 'TAX_INVOICE' && (
              <>
                {invoice.taxType === 'INTER_STATE' ? (
                  <div className="flex justify-between py-0.5 text-slate-600">
                    <span>IGST (3%):</span>
                    <span className="font-mono">₹{invoice.igst.toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>CGST (1.5%):</span>
                      <span className="font-mono">₹{invoice.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-0.5 text-slate-600">
                      <span>SGST (1.5%):</span>
                      <span className="font-mono">₹{invoice.sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex justify-between items-center bg-slate-900 text-white px-4 py-3 rounded-xl mt-3 shadow-sm">
              <span className="font-bold text-sm">Grand Total (INR):</span>
              <span className="font-bold text-lg font-mono text-emerald-400">
                ₹{invoice.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-4">
          <div className="max-w-md">
            <span className="font-bold text-slate-700 block">Terms & Conditions:</span>
            <span>{config.terms}</span>
          </div>

          <div className="text-center sm:text-right">
            <p className="font-bold text-slate-800">For {config.shopName}</p>
            <div className="h-8"></div>
            <p className="text-slate-400 font-medium">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
