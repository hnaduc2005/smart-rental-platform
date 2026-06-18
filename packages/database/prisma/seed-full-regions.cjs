const path = require("path");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/client");
const https = require("https");

require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

function fetchAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchAPI(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function toSlug(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  console.log("Fetching 63 provinces and districts from open-api...");
  const provinces = await fetchAPI("https://provinces.open-api.vn/api/?depth=2");
  
  console.log(`Fetched ${provinces.length} provinces.`);
  
  for (const p of provinces) {
    const pSlug = toSlug(p.name);
    const pId = "region-" + pSlug;
    await prisma.region.upsert({
      where: { slug: pSlug },
      update: { name: p.name, parentId: null },
      create: { id: pId, name: p.name, slug: pSlug, parentId: null }
    });
    
    for (const d of p.districts) {
      const dSlug = pSlug + "-" + toSlug(d.name);
      const dId = "region-" + dSlug;
      await prisma.region.upsert({
        where: { slug: dSlug },
        update: { name: d.name, parentId: pId },
        create: { id: dId, name: d.name, slug: dSlug, parentId: pId }
      });
    }
  }
  console.log("Regions seeded.");

  console.log("Seeding room types...");
  const roomTypes = [
    { name: "Phòng trọ", slug: "phong-tro" },
    { name: "Chung cư mini", slug: "chung-cu-mini" },
    { name: "Nhà nguyên căn", slug: "nha-nguyen-can" },
    { name: "Ký túc xá", slug: "ky-tuc-xa" },
  ];
  for (const rt of roomTypes) {
    await prisma.roomType.upsert({
      where: { slug: rt.slug },
      update: { name: rt.name },
      create: { name: rt.name, slug: rt.slug, description: rt.name }
    });
  }

  console.log("Seeding amenities...");
  const amenities = [
    { name: "Điều hòa", slug: "dieu-hoa" },
    { name: "Nóng lạnh", slug: "nong-lanh" },
    { name: "Giường tủ", slug: "giuong-tu" },
    { name: "Máy giặt", slug: "may-giat" },
    { name: "Tủ lạnh", slug: "tu-lanh" },
    { name: "Bếp", slug: "bep" },
    { name: "Chỗ để xe", slug: "cho-de-xe" },
    { name: "Thang máy", slug: "thang-may" },
  ];
  for (const am of amenities) {
    await prisma.amenity.upsert({
      where: { slug: am.slug },
      update: { name: am.name },
      create: { name: am.name, slug: am.slug, description: am.name }
    });
  }

  console.log("All done! Mock data replaced.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
