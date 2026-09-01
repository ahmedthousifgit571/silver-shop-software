import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, ShopConfig } from './types';
import { generateProductQRCode } from './qr';

export async function generateInvoicePDF(invoice: Invoice, config: ShopConfig): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const accentColor: [number, number, number] = [14, 165, 233]; // Brand Blue
  const textMuted: [number, number, number] = [100, 116, 139]; // Slate 500

  // 1. Header Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(config.shopName || 'KUSHAL JEWELLERYS', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textMuted);
  doc.text(`Proprietor: ${config.legalName || 'DASS GHNANABAVARI'}`, 14, 23);
  doc.text(config.tagline || 'Pure Silver Ornaments, Pooja Articles & Fine Silverware', 14, 27);
  doc.text(config.address || '#3-550, Ground Floor, Bazar Street, Revenue Ward No 3, Srikalahasti, Tirupati Dist., Andhra Pradesh - 517644', 14, 31);
  doc.text(`Phone: ${config.phone || '+91 98765 43210'} | Email: ${config.email || 'sales@kushaljewellerys.com'}`, 14, 35);
  doc.text(`GSTIN: ${config.gstin || '37AVEPG9436B1ZP'} | HSN: ${config.hsnCode || '7113'}`, 14, 39);

  // Invoice Title Right Aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...accentColor);
  doc.text('TAX INVOICE', 196, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 196, 26, { align: 'right' });
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 196, 31, { align: 'right' });
  doc.text(`Payment: ${invoice.paymentMode} (${invoice.paymentStatus})`, 196, 36, { align: 'right' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 45, 196, 45);

  // 2. Bill To / Customer Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Billed To (Customer Details):', 14, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${invoice.customerName}`, 14, 58);
  doc.text(`Mobile: ${invoice.customerPhone}`, 14, 63);
  if (invoice.customerAddress) {
    doc.text(`Address: ${invoice.customerAddress}`, 14, 68);
  }

  // Pre-generate QR codes for items to embed in the PDF table
  const itemRows = await Promise.all(
    invoice.items.map(async (item, idx) => {
      const qrData = item.qrCodeUrl || (await generateProductQRCode(item.productSku));
      return {
        idx: idx + 1,
        desc: `${item.productName}\nSKU: ${item.productSku} (Purity: ${item.purity}%)`,
        grossWt: `${item.grossWeight.toFixed(2)} g`,
        netWt: `${item.netWeight.toFixed(2)} g`,
        rate: `Rs. ${item.silverRateApplied.toFixed(2)}/g`,
        making: `Rs. ${item.makingCharge.toFixed(2)}`,
        qty: item.quantity || 1,
        total: `Rs. ${item.totalPrice.toFixed(2)}`,
        qr: qrData,
      };
    })
  );

  // 3. Items Table using autoTable
  (doc as any).autoTable({
    startY: invoice.customerAddress ? 74 : 68,
    head: [['#', 'Item Description & SKU', 'Gross Wt', 'Net Wt', 'Silver Rate', 'Making', 'Qty', 'Total']],
    body: itemRows.map(r => [r.idx, r.desc, r.grossWt, r.netWt, r.rate, r.making, r.qty, r.total]),
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 64 },
      2: { cellWidth: 18, halign: 'right' },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 26, halign: 'right' },
    },
    theme: 'striped',
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // 4. Old Silver Exchange & Calculation Summary
  let currentY = finalY;

  // Left Column: QR Verification info & Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('Verification & Scan Info:', 14, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...textMuted);
  doc.text('Scan product QR codes on your mobile phone camera to', 14, currentY + 5);
  doc.text('instantly verify live stock, purity, and authenticity.', 14, currentY + 9);

  // If first item has QR code, embed a visual verification QR in footer
  if (itemRows.length > 0 && itemRows[0].qr) {
    try {
      doc.addImage(itemRows[0].qr, 'PNG', 14, currentY + 13, 24, 24);
      doc.setFontSize(7.5);
      doc.text(`Scan: ${itemRows[0].desc.split('\n')[0].substring(0, 20)}...`, 42, currentY + 22);
      doc.text('No login needed for verification', 42, currentY + 27);
    } catch (e) {
      console.warn('Could not render QR code in PDF', e);
    }
  }

  // Right Column: Price Breakdown
  const rightX = 130;
  const valX = 196;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);

  doc.text('Subtotal:', rightX, currentY);
  doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, valX, currentY, { align: 'right' });

  if (invoice.makingCharges > 0) {
    currentY += 5;
    doc.text('Total Making Charges:', rightX, currentY);
    doc.text(`Rs. ${invoice.makingCharges.toFixed(2)}`, valX, currentY, { align: 'right' });
  }

  if (invoice.discount > 0) {
    currentY += 5;
    doc.text('Discount:', rightX, currentY);
    doc.text(`- Rs. ${invoice.discount.toFixed(2)}`, valX, currentY, { align: 'right' });
  }

  if (invoice.oldSilver && invoice.oldSilver.totalValue > 0) {
    currentY += 5;
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`Old Silver Exchange (${invoice.oldSilver.grossWeight}g):`, rightX, currentY);
    doc.text(`- Rs. ${invoice.oldSilver.totalValue.toFixed(2)}`, valX, currentY, { align: 'right' });
    doc.setTextColor(51, 65, 85);
  }

  currentY += 5;
  doc.text('CGST (1.5%):', rightX, currentY);
  doc.text(`Rs. ${invoice.cgst.toFixed(2)}`, valX, currentY, { align: 'right' });

  currentY += 5;
  doc.text('SGST (1.5%):', rightX, currentY);
  doc.text(`Rs. ${invoice.sgst.toFixed(2)}`, valX, currentY, { align: 'right' });

  // Grand Total Box
  currentY += 7;
  doc.setFillColor(241, 245, 249);
  doc.rect(rightX - 2, currentY - 4, 68, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Grand Total:', rightX, currentY + 2);
  doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, valX, currentY + 2, { align: 'right' });

  // 5. Terms and Signature at Bottom
  const bottomY = 270;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(config.terms || 'Terms: 1. Goods exchanged within 7 days against invoice.', 14, bottomY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text(`For ${config.shopName}`, 196, bottomY - 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signatory', 196, bottomY, { align: 'right' });

  return doc;
}
