import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialCustomers } from '@/lib/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const phone = searchParams.get('phone') || '';

  try {
    const customers = await prisma.customer.findMany({
      where: {
        ...(phone ? { phone: { contains: phone } } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } },
              ],
            }
          : {}),
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    let filtered = initialCustomers;
    if (phone) {
      filtered = filtered.filter((c) => c.phone.includes(phone));
    } else if (query) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phone.includes(query)
      );
    }
    return NextResponse.json(filtered);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await prisma.customer.upsert({
      where: { phone: body.phone },
      update: {
        name: body.name,
        email: body.email || null,
        address: body.address || null,
        gstin: body.gstin || null,
        pan: body.pan || null,
      },
      create: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        gstin: body.gstin || null,
        pan: body.pan || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const body = await request.clone().json();
    return NextResponse.json(
      { ...body, id: `cust-${Date.now()}`, totalSpend: 0, totalBills: 0 },
      { status: 200 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { customerId, type, amount, paymentMode, referenceInvoice, notes } = body;

    if (!customerId || amount === undefined) {
      return NextResponse.json({ error: 'Missing customerId or amount' }, { status: 400 });
    }

    const numAmount = Number(Number(amount).toFixed(2));

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    let updatedDue = customer.outstandingBalance;
    let updatedAdv = customer.advanceBalance;

    if (type === 'PAYMENT_CREDIT') {
      updatedDue = Math.max(0, Number((customer.outstandingBalance - numAmount).toFixed(2)));
    } else if (type === 'ADVANCE_DEPOSIT') {
      updatedAdv = Number((customer.advanceBalance + numAmount).toFixed(2));
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        outstandingBalance: updatedDue,
        advanceBalance: updatedAdv,
      },
    });

    // Create Khata transaction record
    try {
      await prisma.khataTransaction.create({
        data: {
          customerId,
          type: type || 'PAYMENT_CREDIT',
          amount: numAmount,
          paymentMode: paymentMode || 'CASH',
          referenceInvoice: referenceInvoice || null,
          notes: notes || null,
        },
      });
    } catch (kErr) {
      console.warn('Could not record khata transaction:', kErr);
    }

    // If referenceInvoice is specified and type is PAYMENT_CREDIT, update that invoice's paid/due
    if (referenceInvoice && type === 'PAYMENT_CREDIT') {
      try {
        const inv = await prisma.invoice.findUnique({ where: { invoiceNumber: referenceInvoice } });
        if (inv) {
          const newPaid = Math.min(inv.grandTotal, Number((inv.paidAmount + numAmount).toFixed(2)));
          const newDue = Math.max(0, Number((inv.grandTotal - newPaid).toFixed(2)));
          await prisma.invoice.update({
            where: { invoiceNumber: referenceInvoice },
            data: {
              paidAmount: newPaid,
              dueAmount: newDue,
              paymentStatus: newDue <= 0 ? 'PAID' : 'PARTIAL',
            },
          });
        }
      } catch (invErr) {
        console.warn('Could not update invoice status on khata payment:', invErr);
      }
    }

    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (err: any) {
    console.error('Customer patch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
