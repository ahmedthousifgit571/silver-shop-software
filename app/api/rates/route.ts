import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialRates } from '@/lib/storage';

export async function GET() {
  try {
    const rates = await prisma.silverRate.findUnique({
      where: { id: 'default' },
    });
    if (rates) {
      return NextResponse.json({
        ...rates,
        goldRate916: rates.goldRate916 ?? 7150.0,
        displayShowcase: (rates as any).displayShowcase || '925',
      });
    }
  } catch (error) {
    // fallback
  }
  return NextResponse.json(initialRates);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updateData: any = {
      fineRate999: Number(body.fineRate999),
      sterlingRate925: Number(body.sterlingRate925),
      utensilRate800: Number(body.utensilRate800),
      goldRate916: body.goldRate916 ? Number(body.goldRate916) : 7150.0,
      scrapRateBuyback: Number(body.scrapRateBuyback),
      lastUpdated: new Date(),
    };
    if (body.displayShowcase) {
      updateData.displayShowcase = body.displayShowcase;
    }

    const createData: any = {
      id: 'default',
      fineRate999: Number(body.fineRate999),
      sterlingRate925: Number(body.sterlingRate925),
      utensilRate800: Number(body.utensilRate800),
      goldRate916: body.goldRate916 ? Number(body.goldRate916) : 7150.0,
      scrapRateBuyback: Number(body.scrapRateBuyback),
      displayShowcase: body.displayShowcase || '925',
    };

    const updated = await (prisma.silverRate as any).upsert({
      where: { id: 'default' },
      update: updateData,
      create: createData,
    });
    return NextResponse.json({
      ...updated,
      displayShowcase: body.displayShowcase || (updated as any).displayShowcase || '925',
    });
  } catch (error) {
    const body = await request.clone().json();
    return NextResponse.json({
      ...body,
      displayShowcase: body.displayShowcase || '925',
      lastUpdated: new Date().toISOString(),
    });
  }
}
