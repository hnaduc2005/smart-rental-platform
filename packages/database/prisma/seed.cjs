const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../generated/client");

const prisma = new PrismaClient();

const TEST_PASSWORDS = {
  admin: "Admin@123456",
  user: "User@123456"
};

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function upsertUser({ id, email, fullName, phone, role, status, password }) {
  const passwordHash = await hashPassword(password);

  return prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      phone,
      role,
      status,
      passwordHash,
      deletedAt: null
    },
    create: {
      id,
      email,
      fullName,
      phone,
      role,
      status,
      passwordHash
    }
  });
}

async function upsertRoomAmenities(roomId, amenityIds) {
  for (const amenityId of amenityIds) {
    await prisma.roomAmenity.upsert({
      where: {
        roomId_amenityId: {
          roomId,
          amenityId
        }
      },
      update: {},
      create: {
        roomId,
        amenityId
      }
    });
  }
}

async function main() {
  const admin = await upsertUser({
    id: "seed-user-admin",
    email: "admin@smart-rental.local",
    fullName: "System Admin",
    phone: "0900000001",
    role: "ADMIN",
    status: "ACTIVE",
    password: TEST_PASSWORDS.admin
  });

  const seeker = await upsertUser({
    id: "seed-user-seeker",
    email: "seeker@smart-rental.local",
    fullName: "Nguyen Van Seeker",
    phone: "0900000002",
    role: "SEEKER",
    status: "ACTIVE",
    password: TEST_PASSWORDS.user
  });

  const tenantUser = await upsertUser({
    id: "seed-user-tenant",
    email: "tenant@smart-rental.local",
    fullName: "Tran Thi Tenant",
    phone: "0900000003",
    role: "TENANT",
    status: "ACTIVE",
    password: TEST_PASSWORDS.user
  });

  const pendingLandlordUser = await upsertUser({
    id: "seed-user-landlord-pending",
    email: "landlord.pending@smart-rental.local",
    fullName: "Le Pending Landlord",
    phone: "0900000004",
    role: "LANDLORD",
    status: "PENDING",
    password: TEST_PASSWORDS.user
  });

  const approvedLandlordUser = await upsertUser({
    id: "seed-user-landlord-approved",
    email: "landlord.approved@smart-rental.local",
    fullName: "Pham Approved Landlord",
    phone: "0900000005",
    role: "LANDLORD",
    status: "ACTIVE",
    password: TEST_PASSWORDS.user
  });

  const tenantProfile = await prisma.tenantProfile.upsert({
    where: { userId: tenantUser.id },
    update: {
      identityNumber: "079200000003",
      emergencyName: "Tran Emergency",
      emergencyPhone: "0900999003"
    },
    create: {
      id: "seed-tenant-profile",
      userId: tenantUser.id,
      identityNumber: "079200000003",
      emergencyName: "Tran Emergency",
      emergencyPhone: "0900999003"
    }
  });

  await prisma.landlordProfile.upsert({
    where: { userId: pendingLandlordUser.id },
    update: {
      publicDisplayName: "Pending Rooms",
      publicPhone: "0900000004",
      publicEmail: "landlord.pending@smart-rental.local",
      businessName: "Pending Rental Group",
      verificationStatus: "PENDING",
      verificationNote: "Awaiting admin review.",
      verifiedAt: null,
      rejectedReason: null
    },
    create: {
      id: "seed-landlord-pending",
      userId: pendingLandlordUser.id,
      publicDisplayName: "Pending Rooms",
      publicPhone: "0900000004",
      publicEmail: "landlord.pending@smart-rental.local",
      businessName: "Pending Rental Group",
      verificationStatus: "PENDING",
      verificationNote: "Awaiting admin review."
    }
  });

  const approvedLandlord = await prisma.landlordProfile.upsert({
    where: { userId: approvedLandlordUser.id },
    update: {
      publicDisplayName: "Approved Home",
      publicPhone: "0900000005",
      publicEmail: "landlord.approved@smart-rental.local",
      businessName: "Approved Rental Company",
      verificationStatus: "APPROVED",
      verificationNote: "Approved seed landlord.",
      verifiedAt: new Date("2026-06-01T09:00:00.000Z"),
      rejectedReason: null
    },
    create: {
      id: "seed-landlord-approved",
      userId: approvedLandlordUser.id,
      publicDisplayName: "Approved Home",
      publicPhone: "0900000005",
      publicEmail: "landlord.approved@smart-rental.local",
      businessName: "Approved Rental Company",
      verificationStatus: "APPROVED",
      verificationNote: "Approved seed landlord.",
      verifiedAt: new Date("2026-06-01T09:00:00.000Z")
    }
  });

  const hcm = await prisma.region.upsert({
    where: { slug: "ho-chi-minh" },
    update: { name: "Ho Chi Minh", parentId: null },
    create: {
      id: "seed-region-hcm",
      name: "Ho Chi Minh",
      slug: "ho-chi-minh"
    }
  });

  const binhThanh = await prisma.region.upsert({
    where: { slug: "binh-thanh" },
    update: { name: "Binh Thanh", parentId: hcm.id },
    create: {
      id: "seed-region-binh-thanh",
      name: "Binh Thanh",
      slug: "binh-thanh",
      parentId: hcm.id
    }
  });

  const district7 = await prisma.region.upsert({
    where: { slug: "quan-7" },
    update: { name: "Quan 7", parentId: hcm.id },
    create: {
      id: "seed-region-quan-7",
      name: "Quan 7",
      slug: "quan-7",
      parentId: hcm.id
    }
  });

  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { slug: "single-room" },
      update: { name: "Phong don", description: "Phong don co ban cho mot nguoi." },
      create: {
        id: "seed-room-type-single",
        name: "Phong don",
        slug: "single-room",
        description: "Phong don co ban cho mot nguoi."
      }
    }),
    prisma.roomType.upsert({
      where: { slug: "studio" },
      update: { name: "Studio", description: "Phong studio khep kin." },
      create: {
        id: "seed-room-type-studio",
        name: "Studio",
        slug: "studio",
        description: "Phong studio khep kin."
      }
    })
  ]);

  const amenities = await Promise.all([
    prisma.amenity.upsert({
      where: { slug: "wifi" },
      update: { name: "Wifi", description: "Internet toc do cao." },
      create: {
        id: "seed-amenity-wifi",
        name: "Wifi",
        slug: "wifi",
        description: "Internet toc do cao."
      }
    }),
    prisma.amenity.upsert({
      where: { slug: "air-conditioner" },
      update: { name: "May lanh", description: "May lanh rieng trong phong." },
      create: {
        id: "seed-amenity-air-conditioner",
        name: "May lanh",
        slug: "air-conditioner",
        description: "May lanh rieng trong phong."
      }
    }),
    prisma.amenity.upsert({
      where: { slug: "parking" },
      update: { name: "Cho de xe", description: "Khu vuc de xe trong nha." },
      create: {
        id: "seed-amenity-parking",
        name: "Cho de xe",
        slug: "parking",
        description: "Khu vuc de xe trong nha."
      }
    }),
    prisma.amenity.upsert({
      where: { slug: "private-bathroom" },
      update: { name: "WC rieng", description: "Nha ve sinh rieng trong phong." },
      create: {
        id: "seed-amenity-private-bathroom",
        name: "WC rieng",
        slug: "private-bathroom",
        description: "Nha ve sinh rieng trong phong."
      }
    })
  ]);

  const propertyA = await prisma.property.upsert({
    where: { id: "seed-property-binh-thanh-a" },
    update: {
      landlordId: approvedLandlord.id,
      regionId: binhThanh.id,
      name: "Nha tro Binh Thanh A",
      address: "12 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh",
      description: "Khu tro gan trung tam, phu hop sinh vien va nhan vien van phong.",
      status: "ACTIVE",
      latitude: "10.7920000",
      longitude: "106.7100000"
    },
    create: {
      id: "seed-property-binh-thanh-a",
      landlordId: approvedLandlord.id,
      regionId: binhThanh.id,
      name: "Nha tro Binh Thanh A",
      address: "12 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh",
      description: "Khu tro gan trung tam, phu hop sinh vien va nhan vien van phong.",
      status: "ACTIVE",
      latitude: "10.7920000",
      longitude: "106.7100000"
    }
  });

  const propertyB = await prisma.property.upsert({
    where: { id: "seed-property-quan-7-b" },
    update: {
      landlordId: approvedLandlord.id,
      regionId: district7.id,
      name: "Can ho mini Quan 7 B",
      address: "88 Nguyen Thi Thap, Quan 7, Ho Chi Minh",
      description: "Can ho mini gan khu van phong Quan 7.",
      status: "ACTIVE",
      latitude: "10.7390000",
      longitude: "106.7140000"
    },
    create: {
      id: "seed-property-quan-7-b",
      landlordId: approvedLandlord.id,
      regionId: district7.id,
      name: "Can ho mini Quan 7 B",
      address: "88 Nguyen Thi Thap, Quan 7, Ho Chi Minh",
      description: "Can ho mini gan khu van phong Quan 7.",
      status: "ACTIVE",
      latitude: "10.7390000",
      longitude: "106.7140000"
    }
  });

  const propertyC = await prisma.property.upsert({
    where: { id: "seed-property-binh-thanh-c" },
    update: {
      landlordId: approvedLandlord.id,
      regionId: binhThanh.id,
      name: "Studio Binh Thanh C",
      address: "45 Xo Viet Nghe Tinh, Binh Thanh, Ho Chi Minh",
      description: "Studio moi, co gac va cua so thoang.",
      status: "ACTIVE",
      latitude: "10.8070000",
      longitude: "106.7090000"
    },
    create: {
      id: "seed-property-binh-thanh-c",
      landlordId: approvedLandlord.id,
      regionId: binhThanh.id,
      name: "Studio Binh Thanh C",
      address: "45 Xo Viet Nghe Tinh, Binh Thanh, Ho Chi Minh",
      description: "Studio moi, co gac va cua so thoang.",
      status: "ACTIVE",
      latitude: "10.8070000",
      longitude: "106.7090000"
    }
  });

  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: "seed-room-a101" },
      update: {
        propertyId: propertyA.id,
        roomTypeId: roomTypes[0].id,
        regionId: binhThanh.id,
        name: "Phong A101",
        description: "Phong don day du noi that co ban.",
        price: "3500000",
        area: "22",
        address: propertyA.address,
        rules: "Khong hut thuoc trong phong.",
        maxOccupants: 2,
        status: "RENTED",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone,
        latitude: "10.7921000",
        longitude: "106.7101000"
      },
      create: {
        id: "seed-room-a101",
        propertyId: propertyA.id,
        roomTypeId: roomTypes[0].id,
        regionId: binhThanh.id,
        name: "Phong A101",
        description: "Phong don day du noi that co ban.",
        price: "3500000",
        area: "22",
        address: propertyA.address,
        rules: "Khong hut thuoc trong phong.",
        maxOccupants: 2,
        status: "RENTED",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone,
        latitude: "10.7921000",
        longitude: "106.7101000"
      }
    }),
    prisma.room.upsert({
      where: { id: "seed-room-a102" },
      update: {
        propertyId: propertyA.id,
        roomTypeId: roomTypes[1].id,
        regionId: binhThanh.id,
        name: "Studio A102",
        description: "Studio co bep nho va ban cong.",
        price: "4800000",
        area: "28",
        address: propertyA.address,
        maxOccupants: 2,
        status: "AVAILABLE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      },
      create: {
        id: "seed-room-a102",
        propertyId: propertyA.id,
        roomTypeId: roomTypes[1].id,
        regionId: binhThanh.id,
        name: "Studio A102",
        description: "Studio co bep nho va ban cong.",
        price: "4800000",
        area: "28",
        address: propertyA.address,
        maxOccupants: 2,
        status: "AVAILABLE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      }
    }),
    prisma.room.upsert({
      where: { id: "seed-room-b201" },
      update: {
        propertyId: propertyB.id,
        roomTypeId: roomTypes[1].id,
        regionId: district7.id,
        name: "Studio B201",
        description: "Phong studio gan Lotte Mart Quan 7.",
        price: "5200000",
        area: "30",
        address: propertyB.address,
        maxOccupants: 2,
        status: "AVAILABLE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      },
      create: {
        id: "seed-room-b201",
        propertyId: propertyB.id,
        roomTypeId: roomTypes[1].id,
        regionId: district7.id,
        name: "Studio B201",
        description: "Phong studio gan Lotte Mart Quan 7.",
        price: "5200000",
        area: "30",
        address: propertyB.address,
        maxOccupants: 2,
        status: "AVAILABLE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      }
    }),
    prisma.room.upsert({
      where: { id: "seed-room-b202" },
      update: {
        propertyId: propertyB.id,
        roomTypeId: roomTypes[0].id,
        regionId: district7.id,
        name: "Phong B202",
        description: "Phong don tiet kiem chi phi.",
        price: "3000000",
        area: "18",
        address: propertyB.address,
        maxOccupants: 1,
        status: "AVAILABLE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      },
      create: {
        id: "seed-room-b202",
        propertyId: propertyB.id,
        roomTypeId: roomTypes[0].id,
        regionId: district7.id,
        name: "Phong B202",
        description: "Phong don tiet kiem chi phi.",
        price: "3000000",
        area: "18",
        address: propertyB.address,
        maxOccupants: 1,
        status: "AVAILABLE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      }
    }),
    prisma.room.upsert({
      where: { id: "seed-room-c301" },
      update: {
        propertyId: propertyC.id,
        roomTypeId: roomTypes[1].id,
        regionId: binhThanh.id,
        name: "Studio C301",
        description: "Studio moi, anh sang tu nhien.",
        price: "5600000",
        area: "32",
        address: propertyC.address,
        maxOccupants: 2,
        status: "MAINTENANCE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      },
      create: {
        id: "seed-room-c301",
        propertyId: propertyC.id,
        roomTypeId: roomTypes[1].id,
        regionId: binhThanh.id,
        name: "Studio C301",
        description: "Studio moi, anh sang tu nhien.",
        price: "5600000",
        area: "32",
        address: propertyC.address,
        maxOccupants: 2,
        status: "MAINTENANCE",
        publicContactName: approvedLandlord.publicDisplayName,
        publicContactPhone: approvedLandlord.publicPhone
      }
    })
  ]);

  for (const room of rooms) {
    for (let index = 1; index <= 3; index += 1) {
      await prisma.roomImage.upsert({
        where: { id: `seed-image-${room.id}-${index}` },
        update: {
          roomId: room.id,
          url: `https://example.com/seed/rooms/${room.id}-${index}.jpg`,
          altText: `${room.name} image ${index}`,
          sortOrder: index
        },
        create: {
          id: `seed-image-${room.id}-${index}`,
          roomId: room.id,
          url: `https://example.com/seed/rooms/${room.id}-${index}.jpg`,
          altText: `${room.name} image ${index}`,
          sortOrder: index
        }
      });
    }
  }

  await upsertRoomAmenities(rooms[0].id, [amenities[0].id, amenities[2].id, amenities[3].id]);
  await upsertRoomAmenities(rooms[1].id, [amenities[0].id, amenities[1].id, amenities[3].id]);
  await upsertRoomAmenities(rooms[2].id, [amenities[0].id, amenities[1].id, amenities[2].id, amenities[3].id]);
  await upsertRoomAmenities(rooms[3].id, [amenities[0].id, amenities[2].id]);
  await upsertRoomAmenities(rooms[4].id, [amenities[0].id, amenities[1].id, amenities[3].id]);

  const paymentMethod = await prisma.paymentMethod.upsert({
    where: { code: "BANK_TRANSFER" },
    update: {
      name: "Chuyen khoan ngan hang",
      description: "Nguoi thue tai len anh chung tu chuyen khoan.",
      isActive: true
    },
    create: {
      id: "seed-payment-method-bank-transfer",
      code: "BANK_TRANSFER",
      name: "Chuyen khoan ngan hang",
      description: "Nguoi thue tai len anh chung tu chuyen khoan.",
      isActive: true
    }
  });

  const packages = await Promise.all([
    prisma.servicePackage.upsert({
      where: { id: "seed-package-basic" },
      update: {
        createdByAdminId: admin.id,
        name: "Basic",
        description: "Goi co ban cho chu tro moi.",
        durationDays: 30,
        maxProperties: 1,
        maxRoomPosts: 5,
        maxRooms: 10,
        price: "99000",
        isActive: true
      },
      create: {
        id: "seed-package-basic",
        createdByAdminId: admin.id,
        name: "Basic",
        description: "Goi co ban cho chu tro moi.",
        durationDays: 30,
        maxProperties: 1,
        maxRoomPosts: 5,
        maxRooms: 10,
        price: "99000",
        isActive: true
      }
    }),
    prisma.servicePackage.upsert({
      where: { id: "seed-package-standard" },
      update: {
        createdByAdminId: admin.id,
        name: "Standard",
        description: "Goi tieu chuan cho chu tro dang van hanh.",
        durationDays: 90,
        maxProperties: 3,
        maxRoomPosts: 30,
        maxRooms: 60,
        price: "249000",
        isActive: true
      },
      create: {
        id: "seed-package-standard",
        createdByAdminId: admin.id,
        name: "Standard",
        description: "Goi tieu chuan cho chu tro dang van hanh.",
        durationDays: 90,
        maxProperties: 3,
        maxRoomPosts: 30,
        maxRooms: 60,
        price: "249000",
        isActive: true
      }
    }),
    prisma.servicePackage.upsert({
      where: { id: "seed-package-pro" },
      update: {
        createdByAdminId: admin.id,
        name: "Pro",
        description: "Goi mo rong cho chu tro co nhieu phong.",
        durationDays: 180,
        maxProperties: 10,
        maxRoomPosts: 120,
        maxRooms: 200,
        price: "799000",
        isActive: true
      },
      create: {
        id: "seed-package-pro",
        createdByAdminId: admin.id,
        name: "Pro",
        description: "Goi mo rong cho chu tro co nhieu phong.",
        durationDays: 180,
        maxProperties: 10,
        maxRoomPosts: 120,
        maxRooms: 200,
        price: "799000",
        isActive: true
      }
    })
  ]);

  await prisma.landlordSubscription.upsert({
    where: { id: "seed-subscription-approved-landlord" },
    update: {
      landlordId: approvedLandlord.id,
      servicePackageId: packages[1].id,
      status: "ACTIVE",
      startsAt: new Date("2026-06-01T00:00:00.000Z"),
      endsAt: new Date("2026-08-30T23:59:59.000Z"),
      purchasedAt: new Date("2026-06-01T10:00:00.000Z"),
      amount: "249000"
    },
    create: {
      id: "seed-subscription-approved-landlord",
      landlordId: approvedLandlord.id,
      servicePackageId: packages[1].id,
      status: "ACTIVE",
      startsAt: new Date("2026-06-01T00:00:00.000Z"),
      endsAt: new Date("2026-08-30T23:59:59.000Z"),
      purchasedAt: new Date("2026-06-01T10:00:00.000Z"),
      amount: "249000"
    }
  });

  await prisma.viewingAppointment.upsert({
    where: { id: "seed-viewing-appointment-a102" },
    update: {
      roomId: rooms[1].id,
      seekerId: seeker.id,
      scheduledAt: new Date("2026-06-20T03:00:00.000Z"),
      status: "CONFIRMED",
      note: "Seeker wants to view the balcony and parking area."
    },
    create: {
      id: "seed-viewing-appointment-a102",
      roomId: rooms[1].id,
      seekerId: seeker.id,
      scheduledAt: new Date("2026-06-20T03:00:00.000Z"),
      status: "CONFIRMED",
      note: "Seeker wants to view the balcony and parking area."
    }
  });

  const rentalRequest = await prisma.rentalRequest.upsert({
    where: { id: "seed-rental-request-a101" },
    update: {
      roomId: rooms[0].id,
      seekerId: tenantUser.id,
      status: "APPROVED",
      message: "Tenant agreed with room rules and monthly rent.",
      approvedAt: new Date("2026-06-01T08:00:00.000Z")
    },
    create: {
      id: "seed-rental-request-a101",
      roomId: rooms[0].id,
      seekerId: tenantUser.id,
      status: "APPROVED",
      message: "Tenant agreed with room rules and monthly rent.",
      approvedAt: new Date("2026-06-01T08:00:00.000Z")
    }
  });

  await prisma.deposit.upsert({
    where: { id: "seed-deposit-a101" },
    update: {
      rentalRequestId: rentalRequest.id,
      amount: "3500000",
      status: "PAID",
      proofImageUrl: "https://example.com/seed/payments/deposit-a101.jpg",
      confirmedAt: new Date("2026-06-01T09:30:00.000Z"),
      rejectedReason: null
    },
    create: {
      id: "seed-deposit-a101",
      rentalRequestId: rentalRequest.id,
      amount: "3500000",
      status: "PAID",
      proofImageUrl: "https://example.com/seed/payments/deposit-a101.jpg",
      confirmedAt: new Date("2026-06-01T09:30:00.000Z")
    }
  });

  const contract = await prisma.contract.upsert({
    where: { id: "seed-contract-a101" },
    update: {
      code: "HD-A101-202606",
      roomId: rooms[0].id,
      activeRoomId: rooms[0].id,
      rentalRequestId: rentalRequest.id,
      tenantProfileId: tenantProfile.id,
      landlordId: approvedLandlord.id,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2027-05-31T23:59:59.000Z"),
      rentAmount: "3500000",
      depositAmount: "3500000",
      paymentDueDay: 5,
      status: "ACTIVE",
      signedOfflineAt: new Date("2026-06-01T10:00:00.000Z"),
      notes: "Seed active contract for room A101."
    },
    create: {
      id: "seed-contract-a101",
      code: "HD-A101-202606",
      roomId: rooms[0].id,
      activeRoomId: rooms[0].id,
      rentalRequestId: rentalRequest.id,
      tenantProfileId: tenantProfile.id,
      landlordId: approvedLandlord.id,
      startDate: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2027-05-31T23:59:59.000Z"),
      rentAmount: "3500000",
      depositAmount: "3500000",
      paymentDueDay: 5,
      status: "ACTIVE",
      signedOfflineAt: new Date("2026-06-01T10:00:00.000Z"),
      notes: "Seed active contract for room A101."
    }
  });

  await prisma.coTenant.upsert({
    where: { id: "seed-co-tenant-a101" },
    update: {
      contractId: contract.id,
      fullName: "Nguyen Van Roommate",
      phone: "0900888001",
      identityNumber: "079200000031",
      dateOfBirth: new Date("2000-01-15T00:00:00.000Z"),
      relationship: "Friend"
    },
    create: {
      id: "seed-co-tenant-a101",
      contractId: contract.id,
      fullName: "Nguyen Van Roommate",
      phone: "0900888001",
      identityNumber: "079200000031",
      dateOfBirth: new Date("2000-01-15T00:00:00.000Z"),
      relationship: "Friend"
    }
  });

  const invoice = await prisma.invoice.upsert({
    where: { id: "seed-invoice-a101-202606" },
    update: {
      contractId: contract.id,
      billingMonth: new Date("2026-06-01T00:00:00.000Z"),
      dueDate: new Date("2026-06-05T23:59:59.000Z"),
      status: "PAID",
      roomAmount: "3500000",
      electricAmount: "240000",
      waterAmount: "80000",
      serviceAmount: "100000",
      totalAmount: "3920000"
    },
    create: {
      id: "seed-invoice-a101-202606",
      contractId: contract.id,
      billingMonth: new Date("2026-06-01T00:00:00.000Z"),
      dueDate: new Date("2026-06-05T23:59:59.000Z"),
      status: "PAID",
      roomAmount: "3500000",
      electricAmount: "240000",
      waterAmount: "80000",
      serviceAmount: "100000",
      totalAmount: "3920000"
    }
  });

  await prisma.invoiceItem.upsert({
    where: { id: "seed-invoice-item-room-a101-202606" },
    update: {
      invoiceId: invoice.id,
      label: "Tien phong thang 06/2026",
      quantity: "1",
      unitPrice: "3500000",
      amount: "3500000"
    },
    create: {
      id: "seed-invoice-item-room-a101-202606",
      invoiceId: invoice.id,
      label: "Tien phong thang 06/2026",
      quantity: "1",
      unitPrice: "3500000",
      amount: "3500000"
    }
  });

  await prisma.invoiceItem.upsert({
    where: { id: "seed-invoice-item-service-a101-202606" },
    update: {
      invoiceId: invoice.id,
      label: "Phi dich vu",
      quantity: "1",
      unitPrice: "100000",
      amount: "100000"
    },
    create: {
      id: "seed-invoice-item-service-a101-202606",
      invoiceId: invoice.id,
      label: "Phi dich vu",
      quantity: "1",
      unitPrice: "100000",
      amount: "100000"
    }
  });

  await prisma.meterReading.upsert({
    where: { id: "seed-meter-electric-a101-202606" },
    update: {
      roomId: rooms[0].id,
      contractId: contract.id,
      invoiceId: invoice.id,
      readingType: "ELECTRICITY",
      previousValue: "1200",
      currentValue: "1280",
      unitPrice: "3000",
      imageUrl: "https://example.com/seed/meters/a101-electric-202606.jpg"
    },
    create: {
      id: "seed-meter-electric-a101-202606",
      roomId: rooms[0].id,
      contractId: contract.id,
      invoiceId: invoice.id,
      readingType: "ELECTRICITY",
      previousValue: "1200",
      currentValue: "1280",
      unitPrice: "3000",
      imageUrl: "https://example.com/seed/meters/a101-electric-202606.jpg"
    }
  });

  await prisma.meterReading.upsert({
    where: { id: "seed-meter-water-a101-202606" },
    update: {
      roomId: rooms[0].id,
      contractId: contract.id,
      invoiceId: invoice.id,
      readingType: "WATER",
      previousValue: "40",
      currentValue: "44",
      unitPrice: "20000",
      imageUrl: "https://example.com/seed/meters/a101-water-202606.jpg"
    },
    create: {
      id: "seed-meter-water-a101-202606",
      roomId: rooms[0].id,
      contractId: contract.id,
      invoiceId: invoice.id,
      readingType: "WATER",
      previousValue: "40",
      currentValue: "44",
      unitPrice: "20000",
      imageUrl: "https://example.com/seed/meters/a101-water-202606.jpg"
    }
  });

  await prisma.payment.upsert({
    where: { id: "seed-payment-a101-202606" },
    update: {
      invoiceId: invoice.id,
      tenantProfileId: tenantProfile.id,
      paymentMethodId: paymentMethod.id,
      amount: "3920000",
      status: "CONFIRMED",
      paidAt: new Date("2026-06-04T04:00:00.000Z"),
      proofImageUrl: "https://example.com/seed/payments/payment-a101-202606.jpg",
      confirmedAt: new Date("2026-06-04T06:00:00.000Z"),
      rejectedReason: null
    },
    create: {
      id: "seed-payment-a101-202606",
      invoiceId: invoice.id,
      tenantProfileId: tenantProfile.id,
      paymentMethodId: paymentMethod.id,
      amount: "3920000",
      status: "CONFIRMED",
      paidAt: new Date("2026-06-04T04:00:00.000Z"),
      proofImageUrl: "https://example.com/seed/payments/payment-a101-202606.jpg",
      confirmedAt: new Date("2026-06-04T06:00:00.000Z")
    }
  });

  await prisma.issueReport.upsert({
    where: { id: "seed-issue-a101-internet" },
    update: {
      tenantProfileId: tenantProfile.id,
      roomId: rooms[0].id,
      contractId: contract.id,
      type: "INTERNET",
      status: "OPEN",
      title: "Wifi chap chon vao buoi toi",
      description: "Tenant reports unstable wifi after 20:00.",
      resolutionNote: null,
      resolvedAt: null
    },
    create: {
      id: "seed-issue-a101-internet",
      tenantProfileId: tenantProfile.id,
      roomId: rooms[0].id,
      contractId: contract.id,
      type: "INTERNET",
      status: "OPEN",
      title: "Wifi chap chon vao buoi toi",
      description: "Tenant reports unstable wifi after 20:00."
    }
  });

  await prisma.review.upsert({
    where: { id: "seed-review-a101" },
    update: {
      tenantProfileId: tenantProfile.id,
      roomId: rooms[0].id,
      landlordId: approvedLandlord.id,
      contractId: contract.id,
      rating: 5,
      comment: "Phong sach se, chu tro ho tro nhanh."
    },
    create: {
      id: "seed-review-a101",
      tenantProfileId: tenantProfile.id,
      roomId: rooms[0].id,
      landlordId: approvedLandlord.id,
      contractId: contract.id,
      rating: 5,
      comment: "Phong sach se, chu tro ho tro nhanh."
    }
  });

  await prisma.adminAuditLog.upsert({
    where: { id: "seed-audit-approve-landlord" },
    update: {
      adminId: admin.id,
      action: "APPROVE_LANDLORD",
      targetType: "LandlordProfile",
      targetId: approvedLandlord.id,
      oldValue: { verificationStatus: "PENDING" },
      newValue: { verificationStatus: "APPROVED" }
    },
    create: {
      id: "seed-audit-approve-landlord",
      adminId: admin.id,
      action: "APPROVE_LANDLORD",
      targetType: "LandlordProfile",
      targetId: approvedLandlord.id,
      oldValue: { verificationStatus: "PENDING" },
      newValue: { verificationStatus: "APPROVED" }
    }
  });

  const checks = await Promise.all([
    prisma.user.count({ where: { email: "admin@smart-rental.local", role: "ADMIN" } }),
    prisma.landlordProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.landlordProfile.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.servicePackage.count({ where: { isActive: true } }),
    prisma.property.count(),
    prisma.room.count(),
    prisma.invoice.count({ where: { payments: { some: {} } } })
  ]);

  console.log("Seed completed");
  console.table({
    adminUsers: checks[0],
    pendingLandlords: checks[1],
    approvedLandlords: checks[2],
    activeServicePackages: checks[3],
    properties: checks[4],
    rooms: checks[5],
    invoicesWithPayments: checks[6]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
