const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./generated/client");
require("dotenv").config({ path: require('path').resolve(__dirname, "../../.env") });
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function run() {
  const seedRooms = [
    "seed-room-a101",
    "seed-room-a102",
    "seed-room-b201",
    "seed-room-b202",
    "seed-room-c301"
  ];

  // Delete dependencies first
  await prisma.payment.deleteMany({ where: { invoice: { contract: { roomId: { in: seedRooms } } } } });
  await prisma.invoice.deleteMany({ where: { contract: { roomId: { in: seedRooms } } } });
  await prisma.coTenant.deleteMany({ where: { contract: { roomId: { in: seedRooms } } } });
  await prisma.contract.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.deposit.deleteMany({ where: { rentalRequest: { roomId: { in: seedRooms } } } });
  await prisma.rentalRequest.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.viewingAppointment.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.roomAmenity.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.roomImage.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.meterReading.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.issueReport.deleteMany({ where: { roomId: { in: seedRooms } } });
  await prisma.review.deleteMany({ where: { roomId: { in: seedRooms } } });
  
  // Delete rooms
  await prisma.room.deleteMany({ where: { id: { in: seedRooms } } });

  // Delete properties
  const seedProperties = [
    "seed-property-binh-thanh-a",
    "seed-property-quan-7-b",
    "seed-property-binh-thanh-c"
  ];
  await prisma.property.deleteMany({ where: { id: { in: seedProperties } } });

  console.log("Cleanup complete!");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
