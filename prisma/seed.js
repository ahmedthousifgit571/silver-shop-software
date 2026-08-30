const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Silver Shop database...');

  // 1. Upsert Default Silver Rates
  await prisma.silverRate.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      fineRate999: 96.0,
      sterlingRate925: 89.0,
      utensilRate800: 77.0,
      scrapRateBuyback: 81.0,
    },
  });

  // 2. Upsert Shop Config
  await prisma.shopConfig.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'SRI SHUBHAM SILVER JEWELS',
      tagline: 'Pure Silver Ornaments, Pooja Articles & Utensils',
      gstin: '29AABCU9603R1ZM',
      hsnCode: '7113',
      phone: '+91 98765 43210',
      email: 'contact@shubhamsilver.com',
      address: '#42, Car Street, Near Temple, City - 560001',
    },
  });

  // 3. Upsert Initial Products
  const sampleProducts = [
    {
      sku: 'SLV-ANK-925-001',
      name: 'Bridal Traditional Silver Payal (Anklet)',
      category: 'Anklets',
      description: 'Handcrafted 92.5 sterling silver bridal payal pair with fine bell charms and intricate filigree work.',
      grossWeight: 52.4,
      stoneWeight: 1.2,
      netWeight: 51.2,
      purity: 92.5,
      purityGrade: '925 Sterling',
      makingChargeType: 'PER_GRAM',
      makingChargeValue: 55.0,
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
      stockQuantity: 8,
      minStockAlert: 2,
    },
    {
      sku: 'SLV-RNG-925-002',
      name: 'Floral Solitaire Sterling Silver Ring',
      category: 'Rings',
      description: 'Contemporary sterling silver daily wear floral ring with rhodium protective polish.',
      grossWeight: 4.8,
      stoneWeight: 0.3,
      netWeight: 4.5,
      purity: 92.5,
      purityGrade: '925 Sterling',
      makingChargeType: 'FLAT',
      makingChargeValue: 250.0,
      imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      stockQuantity: 15,
      minStockAlert: 3,
    },
    {
      sku: 'SLV-IDL-999-003',
      name: 'Pure Silver Lakshmi Ganesha Idol (999 Fine)',
      category: 'Idols',
      description: '99.9% fine silver embossed Lakshmi & Ganesh ji pair for diwali puja and housewarming gifts.',
      grossWeight: 100.0,
      stoneWeight: 0.0,
      netWeight: 100.0,
      purity: 99.9,
      purityGrade: '999 Fine',
      makingChargeType: 'PER_GRAM',
      makingChargeValue: 40.0,
      imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&auto=format&fit=crop&q=80',
      stockQuantity: 5,
      minStockAlert: 2,
    },
    {
      sku: 'SLV-CHN-925-004',
      name: 'Classic Men Cuban Link Silver Chain',
      category: 'Chains',
      description: 'Sturdy 22-inch pure sterling silver 925 cuban link neck chain with lobster lock.',
      grossWeight: 28.6,
      stoneWeight: 0.0,
      netWeight: 28.6,
      purity: 92.5,
      purityGrade: '925 Sterling',
      makingChargeType: 'PER_GRAM',
      makingChargeValue: 45.0,
      imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
      stockQuantity: 6,
      minStockAlert: 2,
    },
    {
      sku: 'SLV-CON-999-005',
      name: '999 Fine Silver Coin (10 Grams) - Lakshmi Embossed',
      category: 'Coins',
      description: 'Assay certified 10g 999 fine silver bullion coin in tamper-evident blister packaging.',
      grossWeight: 10.0,
      stoneWeight: 0.0,
      netWeight: 10.0,
      purity: 99.9,
      purityGrade: '999 Fine',
      makingChargeType: 'FLAT',
      makingChargeValue: 80.0,
      imageUrl: 'https://images.unsplash.com/photo-1624365169365-27a3c3c72b2d?w=600&auto=format&fit=crop&q=80',
      stockQuantity: 25,
      minStockAlert: 5,
    },
    {
      sku: 'SLV-UTN-800-006',
      name: 'Pooja Silver Diya / Lamp (Pair)',
      category: 'Utensils',
      description: 'Authentic South Indian style silver kuthu vilakku / diya pair for daily prayer rituals.',
      grossWeight: 84.0,
      stoneWeight: 0.0,
      netWeight: 84.0,
      purity: 80.0,
      purityGrade: '800 Utensil',
      makingChargeType: 'PER_GRAM',
      makingChargeValue: 35.0,
      imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=80',
      stockQuantity: 4,
      minStockAlert: 2,
    },
  ];

  for (const prod of sampleProducts) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod,
    });
  }

  // 4. Sample Customers
  const customer1 = await prisma.customer.upsert({
    where: { phone: '9845012345' },
    update: {},
    create: {
      name: 'Rajesh Sharma',
      phone: '9845012345',
      email: 'rajesh.sharma@example.com',
      address: 'Jayanagar 4th Block, Bengaluru',
      totalSpend: 14500,
      totalBills: 2,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
