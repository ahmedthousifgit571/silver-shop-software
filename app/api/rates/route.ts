import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialRates } from '@/lib/storage';

export async function GET() {
  try {
    const rates = await prisma.silverRate.findUnique({
      where: { id: 'default' },
    });
    if (rates) return NextResponse.json(rates);
  } catch (error) {
    // fallback
  }
  return NextResponse.json(initialRates);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await prisma.silverRate.upsert({
      where: { id: 'default' },
      update: {
        fineRate999: Number(body.fineRate999),
        sterlingRate925: Number(body.sterlingRate925),
        utensilRate800: Number(body.utensilRate800),
        scrapRateBuyback: Number(body.scrapRateBuyback),
        lastUpdated: new Date(),
      },
      create: {
        id: 'default',
        fineRate999: Number(body.fineRate999),
        sterlingRate925: Number(body.sterlingRate925),
        utensilRate800: Number(body.utensilRate800),
        scrapRateBuyback: Number(body.scrapRateBuyback),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    const body = await request.clone().json();
    return NextResponse.json({ ...body, lastUpdated: new Date().toISOString() });
  }
}
