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
