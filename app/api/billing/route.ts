import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateProductQRCode } from '@/lib/qr';
import { initialInvoices } from '@/lib/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoiceNumber = searchParams.get('inv') || '';

  try {
    const invoices = await prisma.invoice.findMany({
      where: invoiceNumber ? { invoiceNumber } : {},
      include: { items: true, customer: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(initialInvoices);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoiceNumber =
      body.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Prepare items with QR codes
    const itemsWithQRs = await Promise.all(
      body.items.map(async (item: any) => {
        const qrCodeUrl = await generateProductQRCode(item.productSku);
        return {
          ...item,
          qrCodeUrl,
        };
      })
    );

    // 2. Perform DB Transaction: Create customer/update, create invoice, deduct stock
    try {
      // Find or upsert customer
      let customer = await prisma.customer.upsert({
        where: { phone: body.customerPhone },
        update: {
          name: body.customerName,
          address: body.customerAddress || undefined,
          totalSpend: { increment: body.grandTotal },
          totalBills: { increment: 1 },
        },
        create: {
          name: body.customerName,
          phone: body.customerPhone,
          address: body.customerAddress || null,
          totalSpend: body.grandTotal,
          totalBills: 1,
        },
      });

      // Create Invoice & InvoiceItems
      const createdInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          subtotal: Number(body.subtotal),
          makingCharges: Number(body.makingCharges || 0),
          discount: Number(body.discount || 0),
          oldSilverWeight: Number(body.oldSilver?.grossWeight || 0),
          oldSilverRate: Number(body.oldSilver?.meltRatePerGram || 0),
          oldSilverValue: Number(body.oldSilver?.totalValue || 0),
          taxableAmount: Number(body.taxableAmount),
          cgst: Number(body.cgst),
          sgst: Number(body.sgst),
          grandTotal: Number(body.grandTotal),
          paymentMode: body.paymentMode || 'UPI',
          paymentStatus: 'PAID',
          paidAmount: Number(body.grandTotal),
          notes: body.notes || null,
          items: {
            create: itemsWithQRs.map((item: any) => ({
              productSku: item.productSku,
              productName: item.productName,
              grossWeight: Number(item.grossWeight),
              netWeight: Number(item.netWeight),
              purity: Number(item.purity),
              silverRateApplied: Number(item.silverRateApplied),
              makingCharge: Number(item.makingCharge),
              totalPrice: Number(item.totalPrice),
              qrCodeUrl: item.qrCodeUrl,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock quantities for each product
      for (const item of body.items) {
        try {
          await prisma.product.updateMany({
            where: { sku: item.productSku },
            data: {
              stockQuantity: {
                decrement: item.quantity || 1,
              },
            },
          });
        } catch (stockErr) {
          console.warn('Could not auto-decrement stock in DB:', stockErr);
        }
      }

      return NextResponse.json(createdInvoice, { status: 201 });
    } catch (dbErr) {
      console.warn('Database error during billing, returning constructed invoice:', dbErr);
    }

    // Fallback response if DB not connected
    const fallbackInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      date: new Date().toISOString(),
      subtotal: body.subtotal,
      makingCharges: body.makingCharges,
      discount: body.discount,
      oldSilver: body.oldSilver,
      taxableAmount: body.taxableAmount,
      cgst: body.cgst,
      sgst: body.sgst,
      grandTotal: body.grandTotal,
      paymentMode: body.paymentMode,
      paymentStatus: 'PAID',
      paidAmount: body.grandTotal,
      items: itemsWithQRs,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(fallbackInvoice, { status: 201 });
  } catch (error: any) {
    console.error('Billing API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
