const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.amenity.createMany({
    data: [
      { id: 'am-1', name: 'Wifi', slug: 'wifi' },
      { id: 'am-2', name: 'Máy lạnh', slug: 'may-lanh' },
      { id: 'am-3', name: 'Tủ lạnh', slug: 'tu-lanh' },
      { id: 'am-4', name: 'Máy giặt', slug: 'may-giat' },
      { id: 'am-5', name: 'Chỗ để xe', slug: 'cho-de-xe' },
      { id: 'am-6', name: 'WC riêng', slug: 'wc-rieng' }
    ],
    skipDuplicates: true
  });
  console.log('Amenities seeded');
}
run().finally(() => prisma.$disconnect());
