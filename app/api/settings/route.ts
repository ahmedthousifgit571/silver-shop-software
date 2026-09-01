import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialShopConfig } from '@/lib/storage';

export async function GET() {
  try {
    const config = await prisma.shopConfig.findUnique({
      where: { id: 'default' },
    });
    if (config) {
      return NextResponse.json(config);
    }
  } catch (error) {
    console.error('Error fetching shop config from DB:', error);
  }
  return NextResponse.json(initialShopConfig);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await prisma.shopConfig.upsert({
      where: { id: 'default' },
      update: {
        shopName: body.shopName || initialShopConfig.shopName,
        legalName: body.legalName || 'DASS GHNANABAVARI',
        tagline: body.tagline || '',
        gstin: body.gstin || '37AVEPG9436B1ZP',
        hsnCode: body.hsnCode || '7113',
        phone: body.phone || '',
        email: body.email || null,
        address: body.address || '',
        city: body.city || 'Srikalahasti',
        district: body.district || 'Tirupati',
        state: body.state || 'Andhra Pradesh',
        stateCode: body.stateCode || '37',
        pincode: body.pincode || '517644',
        logoUrl: body.logoUrl || null,
        terms: body.terms || '',
        printerWidth: body.printerWidth || '80mm',
      },
      create: {
        id: 'default',
        shopName: body.shopName || initialShopConfig.shopName,
        legalName: body.legalName || 'DASS GHNANABAVARI',
        tagline: body.tagline || '',
        gstin: body.gstin || '37AVEPG9436B1ZP',
        hsnCode: body.hsnCode || '7113',
        phone: body.phone || '',
        email: body.email || null,
        address: body.address || '',
        city: body.city || 'Srikalahasti',
        district: body.district || 'Tirupati',
        state: body.state || 'Andhra Pradesh',
        stateCode: body.stateCode || '37',
        pincode: body.pincode || '517644',
        logoUrl: body.logoUrl || null,
        terms: body.terms || '',
        printerWidth: body.printerWidth || '80mm',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating shop config in DB:', error);
    const body = await request.clone().json();
    return NextResponse.json({ ...initialShopConfig, ...body });
  }
}
