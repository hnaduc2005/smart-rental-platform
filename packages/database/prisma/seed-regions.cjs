const path = require("path");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/client");

require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const PROVINCES = [
  { id: "region-an-giang", name: "An Giang", slug: "an-giang" },
  { id: "region-ba-ria-vung-tau", name: "Bà Rịa - Vũng Tàu", slug: "ba-ria-vung-tau" },
  { id: "region-bac-giang", name: "Bắc Giang", slug: "bac-giang" },
  { id: "region-bac-kan", name: "Bắc Kạn", slug: "bac-kan" },
  { id: "region-bac-lieu", name: "Bạc Liêu", slug: "bac-lieu" },
  { id: "region-bac-ninh", name: "Bắc Ninh", slug: "bac-ninh" },
  { id: "region-ben-tre", name: "Bến Tre", slug: "ben-tre" },
  { id: "region-binh-dinh", name: "Bình Định", slug: "binh-dinh" },
  { id: "region-binh-duong", name: "Bình Dương", slug: "binh-duong" },
  { id: "region-binh-phuoc", name: "Bình Phước", slug: "binh-phuoc" },
  { id: "region-binh-thuan", name: "Bình Thuận", slug: "binh-thuan" },
  { id: "region-ca-mau", name: "Cà Mau", slug: "ca-mau" },
  { id: "region-can-tho", name: "Cần Thơ", slug: "can-tho" },
  { id: "region-cao-bang", name: "Cao Bằng", slug: "cao-bang" },
  { id: "region-da-nang", name: "Đà Nẵng", slug: "da-nang" },
  { id: "region-dak-lak", name: "Đắk Lắk", slug: "dak-lak" },
  { id: "region-dak-nong", name: "Đắk Nông", slug: "dak-nong" },
  { id: "region-dien-bien", name: "Điện Biên", slug: "dien-bien" },
  { id: "region-dong-nai", name: "Đồng Nai", slug: "dong-nai" },
  { id: "region-dong-thap", name: "Đồng Tháp", slug: "dong-thap" },
  { id: "region-gia-lai", name: "Gia Lai", slug: "gia-lai" },
  { id: "region-ha-giang", name: "Hà Giang", slug: "ha-giang" },
  { id: "region-ha-nam", name: "Hà Nam", slug: "ha-nam" },
  { id: "region-ha-noi", name: "Hà Nội", slug: "ha-noi" },
  { id: "region-ha-tinh", name: "Hà Tĩnh", slug: "ha-tinh" },
  { id: "region-hai-duong", name: "Hải Dương", slug: "hai-duong" },
  { id: "region-hai-phong", name: "Hải Phòng", slug: "hai-phong" },
  { id: "region-hau-giang", name: "Hậu Giang", slug: "hau-giang" },
  { id: "region-hoa-binh", name: "Hòa Bình", slug: "hoa-binh" },
  { id: "region-hung-yen", name: "Hưng Yên", slug: "hung-yen" },
  { id: "region-khanh-hoa", name: "Khánh Hòa", slug: "khanh-hoa" },
  { id: "region-kien-giang", name: "Kiên Giang", slug: "kien-giang" },
  { id: "region-kon-tum", name: "Kon Tum", slug: "kon-tum" },
  { id: "region-lai-chau", name: "Lai Châu", slug: "lai-chau" },
  { id: "region-lam-dong", name: "Lâm Đồng", slug: "lam-dong" },
  { id: "region-lang-son", name: "Lạng Sơn", slug: "lang-son" },
  { id: "region-lao-cai", name: "Lào Cai", slug: "lao-cai" },
  { id: "region-long-an", name: "Long An", slug: "long-an" },
  { id: "region-nam-dinh", name: "Nam Định", slug: "nam-dinh" },
  { id: "region-nghe-an", name: "Nghệ An", slug: "nghe-an" },
  { id: "region-ninh-binh", name: "Ninh Bình", slug: "ninh-binh" },
  { id: "region-ninh-thuan", name: "Ninh Thuận", slug: "ninh-thuan" },
  { id: "region-phu-tho", name: "Phú Thọ", slug: "phu-tho" },
  { id: "region-phu-yen", name: "Phú Yên", slug: "phu-yen" },
  { id: "region-quang-binh", name: "Quảng Bình", slug: "quang-binh" },
  { id: "region-quang-nam", name: "Quảng Nam", slug: "quang-nam" },
  { id: "region-quang-ngai", name: "Quảng Ngãi", slug: "quang-ngai" },
  { id: "region-quang-ninh", name: "Quảng Ninh", slug: "quang-ninh" },
  { id: "region-quang-tri", name: "Quảng Trị", slug: "quang-tri" },
  { id: "region-soc-trang", name: "Sóc Trăng", slug: "soc-trang" },
  { id: "region-son-la", name: "Sơn La", slug: "son-la" },
  { id: "region-tay-ninh", name: "Tây Ninh", slug: "tay-ninh" },
  { id: "region-thai-binh", name: "Thái Bình", slug: "thai-binh" },
  { id: "region-thai-nguyen", name: "Thái Nguyên", slug: "thai-nguyen" },
  { id: "region-thanh-hoa", name: "Thanh Hóa", slug: "thanh-hoa" },
  { id: "region-thua-thien-hue", name: "Thừa Thiên Huế", slug: "thua-thien-hue" },
  { id: "region-tien-giang", name: "Tiền Giang", slug: "tien-giang" },
  { id: "region-tp-hcm", name: "TP. Hồ Chí Minh", slug: "tp-ho-chi-minh" },
  { id: "region-tra-vinh", name: "Trà Vinh", slug: "tra-vinh" },
  { id: "region-tuyen-quang", name: "Tuyên Quang", slug: "tuyen-quang" },
  { id: "region-vinh-long", name: "Vĩnh Long", slug: "vinh-long" },
  { id: "region-vinh-phuc", name: "Vĩnh Phúc", slug: "vinh-phuc" },
  { id: "region-yen-bai", name: "Yên Bái", slug: "yen-bai" },
];

// Districts for major cities
const DISTRICTS = [
  // TP. Hồ Chí Minh
  { id: "region-hcm-q1", name: "Quận 1", slug: "hcm-quan-1", parentId: "region-tp-hcm" },
  { id: "region-hcm-q3", name: "Quận 3", slug: "hcm-quan-3", parentId: "region-tp-hcm" },
  { id: "region-hcm-q4", name: "Quận 4", slug: "hcm-quan-4", parentId: "region-tp-hcm" },
  { id: "region-hcm-q5", name: "Quận 5", slug: "hcm-quan-5", parentId: "region-tp-hcm" },
  { id: "region-hcm-q6", name: "Quận 6", slug: "hcm-quan-6", parentId: "region-tp-hcm" },
  { id: "region-hcm-q7", name: "Quận 7", slug: "hcm-quan-7", parentId: "region-tp-hcm" },
  { id: "region-hcm-q8", name: "Quận 8", slug: "hcm-quan-8", parentId: "region-tp-hcm" },
  { id: "region-hcm-q10", name: "Quận 10", slug: "hcm-quan-10", parentId: "region-tp-hcm" },
  { id: "region-hcm-q11", name: "Quận 11", slug: "hcm-quan-11", parentId: "region-tp-hcm" },
  { id: "region-hcm-q12", name: "Quận 12", slug: "hcm-quan-12", parentId: "region-tp-hcm" },
  { id: "region-hcm-binh-tan", name: "Bình Tân", slug: "hcm-binh-tan", parentId: "region-tp-hcm" },
  { id: "region-hcm-binh-thanh", name: "Bình Thạnh", slug: "hcm-binh-thanh", parentId: "region-tp-hcm" },
  { id: "region-hcm-go-vap", name: "Gò Vấp", slug: "hcm-go-vap", parentId: "region-tp-hcm" },
  { id: "region-hcm-phu-nhuan", name: "Phú Nhuận", slug: "hcm-phu-nhuan", parentId: "region-tp-hcm" },
  { id: "region-hcm-tan-binh", name: "Tân Bình", slug: "hcm-tan-binh", parentId: "region-tp-hcm" },
  { id: "region-hcm-tan-phu", name: "Tân Phú", slug: "hcm-tan-phu", parentId: "region-tp-hcm" },
  { id: "region-hcm-thu-duc", name: "TP. Thủ Đức", slug: "hcm-thu-duc", parentId: "region-tp-hcm" },
  { id: "region-hcm-binh-chanh", name: "Bình Chánh", slug: "hcm-binh-chanh", parentId: "region-tp-hcm" },
  { id: "region-hcm-cu-chi", name: "Củ Chi", slug: "hcm-cu-chi", parentId: "region-tp-hcm" },
  { id: "region-hcm-hoc-mon", name: "Hóc Môn", slug: "hcm-hoc-mon", parentId: "region-tp-hcm" },
  { id: "region-hcm-nha-be", name: "Nhà Bè", slug: "hcm-nha-be", parentId: "region-tp-hcm" },
  { id: "region-hcm-can-gio", name: "Cần Giờ", slug: "hcm-can-gio", parentId: "region-tp-hcm" },
  // Hà Nội
  { id: "region-hn-hoan-kiem", name: "Hoàn Kiếm", slug: "hn-hoan-kiem", parentId: "region-ha-noi" },
  { id: "region-hn-dong-da", name: "Đống Đa", slug: "hn-dong-da", parentId: "region-ha-noi" },
  { id: "region-hn-ba-dinh", name: "Ba Đình", slug: "hn-ba-dinh", parentId: "region-ha-noi" },
  { id: "region-hn-hai-ba-trung", name: "Hai Bà Trưng", slug: "hn-hai-ba-trung", parentId: "region-ha-noi" },
  { id: "region-hn-cau-giay", name: "Cầu Giấy", slug: "hn-cau-giay", parentId: "region-ha-noi" },
  { id: "region-hn-thanh-xuan", name: "Thanh Xuân", slug: "hn-thanh-xuan", parentId: "region-ha-noi" },
  { id: "region-hn-ha-dong", name: "Hà Đông", slug: "hn-ha-dong", parentId: "region-ha-noi" },
  { id: "region-hn-long-bien", name: "Long Biên", slug: "hn-long-bien", parentId: "region-ha-noi" },
  { id: "region-hn-hoang-mai", name: "Hoàng Mai", slug: "hn-hoang-mai", parentId: "region-ha-noi" },
  { id: "region-hn-bac-tu-liem", name: "Bắc Từ Liêm", slug: "hn-bac-tu-liem", parentId: "region-ha-noi" },
  { id: "region-hn-nam-tu-liem", name: "Nam Từ Liêm", slug: "hn-nam-tu-liem", parentId: "region-ha-noi" },
  { id: "region-hn-tay-ho", name: "Tây Hồ", slug: "hn-tay-ho", parentId: "region-ha-noi" },
  // Đà Nẵng
  { id: "region-dn-hai-chau", name: "Hải Châu", slug: "dn-hai-chau", parentId: "region-da-nang" },
  { id: "region-dn-thanh-khe", name: "Thanh Khê", slug: "dn-thanh-khe", parentId: "region-da-nang" },
  { id: "region-dn-son-tra", name: "Sơn Trà", slug: "dn-son-tra", parentId: "region-da-nang" },
  { id: "region-dn-ngu-hanh-son", name: "Ngũ Hành Sơn", slug: "dn-ngu-hanh-son", parentId: "region-da-nang" },
  { id: "region-dn-lien-chieu", name: "Liên Chiểu", slug: "dn-lien-chieu", parentId: "region-da-nang" },
  { id: "region-dn-cam-le", name: "Cẩm Lệ", slug: "dn-cam-le", parentId: "region-da-nang" },
  // Bình Dương
  { id: "region-bd-thu-dau-mot", name: "Thủ Dầu Một", slug: "bd-thu-dau-mot", parentId: "region-binh-duong" },
  { id: "region-bd-thuan-an", name: "Thuận An", slug: "bd-thuan-an", parentId: "region-binh-duong" },
  { id: "region-bd-di-an", name: "Dĩ An", slug: "bd-di-an", parentId: "region-binh-duong" },
  { id: "region-bd-ben-cat", name: "Bến Cát", slug: "bd-ben-cat", parentId: "region-binh-duong" },
  { id: "region-bd-tan-uyen", name: "Tân Uyên", slug: "bd-tan-uyen", parentId: "region-binh-duong" },
];

async function main() {
  console.log("Seeding provinces...");
  for (const p of PROVINCES) {
    await prisma.region.upsert({
      where: { slug: p.slug },
      update: { name: p.name },
      create: { id: p.id, name: p.name, slug: p.slug, parentId: null },
    });
  }
  console.log(`✓ ${PROVINCES.length} provinces seeded`);

  console.log("Seeding districts...");
  for (const d of DISTRICTS) {
    await prisma.region.upsert({
      where: { slug: d.slug },
      update: { name: d.name, parentId: d.parentId },
      create: { id: d.id, name: d.name, slug: d.slug, parentId: d.parentId },
    });
  }
  console.log(`✓ ${DISTRICTS.length} districts seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
