const assert = require("node:assert/strict");
const test = require("node:test");

process.env.JWT_SECRET ??= "public-access-test-secret";

const { NotFoundException } = require("@nestjs/common");
const { GUARDS_METADATA } = require("@nestjs/common/constants");
const {
  PropertyStatus,
  RentalRequestStatus,
  Role,
  RoomStatus,
  UserStatus,
  VerificationStatus
} = require("@smart-rental/database");
const { ROLES_KEY } = require("../dist/common/decorators/roles.decorator.js");
const { JwtAuthGuard } = require("../dist/common/guards/jwt-auth.guard.js");
const { RolesGuard } = require("../dist/common/guards/roles.guard.js");
const {
  publicPropertyWhere,
  publicRoomWhere
} = require("../dist/common/filters/public-listing.filters.js");
const {
  publicLandlordSelect
} = require("../dist/common/selects/safe-user.select.js");
const { PropertiesController } = require("../dist/modules/properties/properties.controller.js");
const { PropertiesService } = require("../dist/modules/properties/properties.service.js");
const { RoomsController } = require("../dist/modules/rooms/rooms.controller.js");
const { RoomsService } = require("../dist/modules/rooms/rooms.service.js");
const { TenantsController } = require("../dist/modules/tenants/tenants.controller.js");
const { TenantsService } = require("../dist/modules/tenants/tenants.service.js");

const expectedPublicLandlordWhere = {
  verificationStatus: VerificationStatus.APPROVED,
  user: {
    is: {
      role: Role.LANDLORD,
      status: UserStatus.ACTIVE,
      deletedAt: null
    }
  }
};

const expectedPublicPropertyWhere = {
  status: PropertyStatus.ACTIVE,
  landlord: { is: expectedPublicLandlordWhere }
};

const expectedPublicRoomWhere = {
  status: RoomStatus.AVAILABLE,
  property: { is: expectedPublicPropertyWhere }
};

function assertNotFound(promise) {
  return assert.rejects(promise, (error) => {
    assert.ok(error instanceof NotFoundException);
    assert.equal(error.getStatus(), 404);
    return true;
  });
}

test("restricts the global tenant list to admins", () => {
  const classGuards = Reflect.getMetadata(GUARDS_METADATA, TenantsController);

  assert.ok(classGuards.includes(JwtAuthGuard));
  assert.ok(classGuards.includes(RolesGuard));
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, TenantsController.prototype.findAll),
    [Role.ADMIN]
  );
  assert.deepEqual(
    Reflect.getMetadata(ROLES_KEY, TenantsController.prototype.getForLandlord),
    [Role.LANDLORD]
  );
});

test("scopes a landlord tenant list to contracts or approved rental requests", async () => {
  let tenantQuery;
  const service = new TenantsService({
    landlordProfile: {
      findUnique: async (query) => {
        assert.deepEqual(query, { where: { userId: "landlord-user-id" } });
        return { id: "landlord-profile-id" };
      }
    },
    tenantProfile: {
      findMany: async (query) => {
        tenantQuery = query;
        return [];
      }
    }
  });

  await service.getForLandlord("landlord-user-id");

  assert.deepEqual(tenantQuery.where, {
    OR: [
      {
        contracts: {
          some: { landlordId: "landlord-profile-id" }
        }
      },
      {
        user: {
          is: {
            rentalRequests: {
              some: {
                status: RentalRequestStatus.APPROVED,
                room: {
                  is: {
                    property: {
                      is: { landlordId: "landlord-profile-id" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]
  });
  assert.deepEqual(tenantQuery.include.user.select, {
    fullName: true,
    phone: true,
    email: true
  });
});

test("defines public filters for approved active landlords and visible listings", () => {
  assert.deepEqual(publicPropertyWhere, expectedPublicPropertyWhere);
  assert.deepEqual(publicRoomWhere, expectedPublicRoomWhere);
});

test("limits the public landlord projection to explicitly public profile fields", () => {
  assert.deepEqual(publicLandlordSelect, {
    id: true,
    publicDisplayName: true,
    publicPhone: true,
    publicEmail: true,
    businessName: true,
    user: {
      select: {
        id: true,
        fullName: true,
        avatarUrl: true
      }
    }
  });
});

test("uses the public service methods from property and room controllers", () => {
  const propertyList = Symbol("property-list");
  const propertyDetail = Symbol("property-detail");
  const propertiesController = new PropertiesController({
    findPublic: () => propertyList,
    findPublicById: (id) => [propertyDetail, id]
  });

  const roomList = Symbol("room-list");
  const roomDetail = Symbol("room-detail");
  const roomsController = new RoomsController({
    findPublic: () => roomList,
    findPublicById: (id) => [roomDetail, id]
  });

  assert.equal(propertiesController.findAll(), propertyList);
  assert.deepEqual(propertiesController.findOne("property-id"), [propertyDetail, "property-id"]);
  assert.equal(roomsController.findAll(), roomList);
  assert.deepEqual(roomsController.findOne("room-id"), [roomDetail, "room-id"]);
});

test("filters public property lists and details, including nested rooms", async () => {
  let listQuery;
  let detailQuery;
  const property = { id: "property-id" };
  const service = new PropertiesService({
    property: {
      findMany: async (query) => {
        listQuery = query;
        return [];
      },
      findFirst: async (query) => {
        detailQuery = query;
        return property;
      }
    }
  });

  await service.findPublic();
  assert.deepEqual(listQuery.where, expectedPublicPropertyWhere);
  assert.deepEqual(listQuery.include.rooms.where, { status: RoomStatus.AVAILABLE });
  assert.equal(Object.hasOwn(listQuery.include.landlord.select, "bankAccountNumber"), false);

  assert.equal(await service.findPublicById("property-id"), property);
  assert.deepEqual(detailQuery.where, {
    id: "property-id",
    ...expectedPublicPropertyWhere
  });
  assert.deepEqual(detailQuery.include.rooms.where, { status: RoomStatus.AVAILABLE });
  assert.equal(Object.hasOwn(detailQuery.include.landlord.select, "bankAccountNumber"), false);

  const missingService = new PropertiesService({
    property: { findFirst: async () => null }
  });
  await assertNotFound(missingService.findPublicById("hidden-property-id"));
});

test("filters public room lists and details without exposing active contracts", async () => {
  let listQuery;
  let detailQuery;
  const room = { id: "room-id" };
  const service = new RoomsService({
    room: {
      findMany: async (query) => {
        listQuery = query;
        return [];
      },
      findFirst: async (query) => {
        detailQuery = query;
        return room;
      }
    }
  });

  await service.findPublic();
  assert.deepEqual(listQuery.where, expectedPublicRoomWhere);
  assert.equal(
    Object.hasOwn(listQuery.include.property.include.landlord.select, "bankAccountNumber"),
    false
  );

  assert.equal(await service.findPublicById("room-id"), room);
  assert.deepEqual(detailQuery.where, {
    id: "room-id",
    ...expectedPublicRoomWhere
  });
  assert.equal(Object.hasOwn(detailQuery.include, "activeContract"), false);
  assert.equal(
    Object.hasOwn(detailQuery.include.property.include.landlord.select, "bankAccountNumber"),
    false
  );

  const missingService = new RoomsService({
    room: { findFirst: async () => null }
  });
  await assertNotFound(missingService.findPublicById("hidden-room-id"));
});
