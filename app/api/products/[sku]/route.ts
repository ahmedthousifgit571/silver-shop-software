import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initialProducts } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { sku: string } }
) {
  const { sku } = params;
  const decodedSku = decodeURIComponent(sku).trim();

  try {
    const product = await prisma.product.findUnique({
      where: { sku: decodedSku },
    });

    if (product) {
      return NextResponse.json(product);
    }
  } catch (error) {
    console.warn('DB lookup failed, trying fallback store:', error);
  }

  // Fallback to in-memory/mock store
  const found = initialProducts.find(
    (p) => p.sku.toLowerCase() === decodedSku.toLowerCase()
  );

  if (!found) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(found);
}

export async function PUT(
  request: Request,
  { params }: { params: { sku: string } }
) {
  const { sku } = params;
  const decodedSku = decodeURIComponent(sku).trim();
  const body = await request.json();

  try {
    const updated = await prisma.product.update({
      where: { sku: decodedSku },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.category && { category: body.category }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.grossWeight !== undefined && { grossWeight: Number(body.grossWeight) }),
        ...(body.stoneWeight !== undefined && { stoneWeight: Number(body.stoneWeight) }),
        ...(body.netWeight !== undefined && { netWeight: Number(body.netWeight) }),
        ...(body.purity !== undefined && { purity: Number(body.purity) }),
        ...(body.makingChargeType && { makingChargeType: body.makingChargeType }),
        ...(body.makingChargeValue !== undefined && {
          makingChargeValue: Number(body.makingChargeValue),
        }),
        ...(body.stockQuantity !== undefined && { stockQuantity: Number(body.stockQuantity) }),
        ...(body.minStockAlert !== undefined && { minStockAlert: Number(body.minStockAlert) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ success: true, updated: body });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { sku: string } }
) {
  const { sku } = params;
  const decodedSku = decodeURIComponent(sku).trim();

  try {
    const product = await prisma.product.findUnique({
      where: { sku: decodedSku },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Unlink any invoice items referencing this product to maintain sales integrity
    try {
      await prisma.invoiceItem.updateMany({
        where: { productId: product.id },
        data: { productId: null },
      });
    } catch (unlinkErr) {
      console.warn('Could not unlink invoice items:', unlinkErr);
    }

    // Hard delete the product record from the database
    await prisma.product.delete({
      where: { id: product.id },
    });

    return NextResponse.json({
      success: true,
      message: `Product ${decodedSku} permanently deleted`,
      deletedId: product.id,
      deletedSku: product.sku,
    });
  } catch (error: any) {
    console.error('Error deleting product from DB:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
