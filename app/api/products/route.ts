import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialProducts } from '@/lib/storage';
import { generateProductQRCode } from '@/lib/qr';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { sku: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(category && category !== 'All' ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    // Graceful fallback to initial mock data if database is not yet migrated
    let filtered = initialProducts;
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category);
    }
    return NextResponse.json(filtered);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sku = body.sku || `SLV-${Date.now().toString().slice(-6)}`;
    const qrCodeUrl = await generateProductQRCode(sku);

    const product = await prisma.product.create({
      data: {
        sku,
        name: body.name,
        category: body.category || 'Anklets',
        description: body.description || '',
        grossWeight: Number(body.grossWeight),
        stoneWeight: Number(body.stoneWeight || 0),
        netWeight: Number(body.netWeight),
        purity: Number(body.purity || 92.5),
        purityGrade: body.purityGrade || '925 Sterling',
        makingChargeType: body.makingChargeType || 'PER_GRAM',
        makingChargeValue: Number(body.makingChargeValue || 0),
        imageUrl: body.imageUrl || null,
        stockQuantity: Number(body.stockQuantity || 1),
        minStockAlert: Number(body.minStockAlert || 2),
        qrCodeUrl,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product in DB:', error);
    // If DB fails, echo back the saved product structure
    return NextResponse.json(
      { ...await request.clone().json(), id: `temp-${Date.now()}` },
      { status: 200 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');
    let sku = searchParams.get('sku');

    if (!id && !sku) {
      try {
        const body = await request.json();
        id = body?.id;
        sku = body?.sku;
      } catch (e) {}
    }

    if (!id && !sku) {
      return NextResponse.json(
        { error: 'Product ID or SKU is required for deletion' },
        { status: 400 }
      );
    }

    const product = id
      ? await prisma.product.findUnique({ where: { id } })
      : await prisma.product.findUnique({ where: { sku: sku! } });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Unlink any invoice items referencing this product to prevent foreign key errors
    try {
      await prisma.invoiceItem.updateMany({
        where: { productId: product.id },
        data: { productId: null },
      });
    } catch (unlinkErr) {
      console.warn('Could not unlink invoice items:', unlinkErr);
    }

    // Hard delete product record from database
    await prisma.product.delete({
      where: { id: product.id },
    });

    return NextResponse.json({
      success: true,
      message: `Product "${product.name}" (${product.sku}) permanently deleted`,
      deletedId: product.id,
      deletedSku: product.sku,
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

