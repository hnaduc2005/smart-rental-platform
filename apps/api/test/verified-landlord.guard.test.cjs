const assert = require("node:assert/strict");
const test = require("node:test");

process.env.JWT_SECRET ??= "verified-landlord-guard-test-secret";

const { ForbiddenException } = require("@nestjs/common");
const { GUARDS_METADATA, MODULE_METADATA } = require("@nestjs/common/constants");
const { Role, UserStatus, VerificationStatus } = require("@smart-rental/database");
const {
  VerifiedLandlordGuard
} = require("../dist/common/guards/verified-landlord.guard.js");
const { AuthModule } = require("../dist/modules/auth/auth.module.js");
const { PropertiesController } = require("../dist/modules/properties/properties.controller.js");
const { RoomsController } = require("../dist/modules/rooms/rooms.controller.js");

function createContext(user) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers: {}, user })
    })
  };
}

function createUser(overrides = {}) {
  return {
    id: "landlord-user-id",
    email: "landlord@example.com",
    phone: null,
    fullName: "Test Landlord",
    avatarUrl: null,
    role: Role.LANDLORD,
    status: UserStatus.ACTIVE,
    ...overrides
  };
}

function createGuard(landlordProfile) {
  const prisma = {
    landlordProfile: {
      findUnique: async (query) => {
        assert.deepEqual(query, {
          where: { userId: "landlord-user-id" },
          select: { verificationStatus: true }
        });
        return landlordProfile;
      }
    }
  };

  return new VerifiedLandlordGuard(prisma);
}

async function assertForbidden(promise) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof ForbiddenException);
    assert.equal(error.getStatus(), 403);
    return true;
  });
}

test("blocks a pending landlord account even if its profile is approved", async () => {
  const guard = createGuard({ verificationStatus: VerificationStatus.APPROVED });

  await assertForbidden(
    guard.canActivate(createContext(createUser({ status: UserStatus.PENDING })))
  );
});

test("blocks an active landlord whose profile is still pending", async () => {
  const guard = createGuard({ verificationStatus: VerificationStatus.PENDING });

  await assertForbidden(guard.canActivate(createContext(createUser())));
});

test("blocks an active landlord without a landlord profile", async () => {
  const guard = createGuard(null);

  await assertForbidden(guard.canActivate(createContext(createUser())));
});

test("allows a landlord only when both account and profile are approved", async () => {
  const guard = createGuard({ verificationStatus: VerificationStatus.APPROVED });

  assert.equal(await guard.canActivate(createContext(createUser())), true);
});

test("blocks a non-landlord user", async () => {
  const guard = createGuard({ verificationStatus: VerificationStatus.APPROVED });

  await assertForbidden(
    guard.canActivate(createContext(createUser({ role: Role.SEEKER })))
  );
});

test("registers and exports the guard from the global auth module", () => {
  const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AuthModule);
  const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, AuthModule);

  assert.ok(providers.includes(VerifiedLandlordGuard));
  assert.ok(exports.includes(VerifiedLandlordGuard));
});

test("protects every property and room write route without blocking read routes", () => {
  for (const controller of [PropertiesController, RoomsController]) {
    for (const methodName of ["create", "update", "remove"]) {
      const guards = Reflect.getMetadata(GUARDS_METADATA, controller.prototype[methodName]);
      assert.ok(
        guards.includes(VerifiedLandlordGuard),
        `${controller.name}.${methodName} must use VerifiedLandlordGuard`
      );
    }

    const readGuards = Reflect.getMetadata(GUARDS_METADATA, controller.prototype.findMyRooms ?? controller.prototype.findMyProperties);
    assert.ok(!readGuards.includes(VerifiedLandlordGuard));
  }
});
