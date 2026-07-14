import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import {
  AdminAuditAction,
  ContractStatus,
  DepositStatus,
  InvoiceStatus,
  PaymentStatus,
  Prisma,
  PropertyStatus,
  RentalRequestStatus,
  Role,
  RoomStatus,
  SubscriptionStatus,
  UserStatus,
  VerificationStatus
} from "@smart-rental/database";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { safeUserSelect } from "../../common/selects/safe-user.select";
import { PrismaService } from "../prisma/prisma.service";
import {
  AdminLandlordsQueryDto,
  AdminRoomsQueryDto,
  AdminUsersQueryDto,
  CategoryQueryDto,
  SetActiveDto,
  UpsertCategoryDto,
  UpsertRegionDto
} from "./dto/admin.dto";

const blockedStatuses: UserStatus[] = [UserStatus.LOCKED, UserStatus.SUSPENDED, UserStatus.DELETED];

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: "ok",
      module: "admin",
      message: "Admin API is protected"
    };
  }

  getCurrentAdmin(user: AuthenticatedUser) {
    return user;
  }

  async getDashboardSummary() {
    const [
      totalUsers,
      totalLandlords,
      pendingLandlords,
      totalTenants,
      totalSeekers,
      activeRooms,
      availableRooms,
      rentedRooms,
      pendingRentalRequests,
      activeContracts,
      unpaidInvoices,
      activeServicePackages,
      recentUsers,
      recentRentalRequests,
      recentInvoices
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { role: Role.LANDLORD, deletedAt: null } }),
      this.prisma.landlordProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      this.prisma.user.count({ where: { role: Role.TENANT, deletedAt: null } }),
      this.prisma.user.count({ where: { role: Role.SEEKER, deletedAt: null } }),
      this.prisma.room.count({ where: { status: { notIn: [RoomStatus.HIDDEN, RoomStatus.MAINTENANCE] } } }),
      this.prisma.room.count({ where: { status: RoomStatus.AVAILABLE } }),
      this.prisma.room.count({ where: { status: RoomStatus.RENTED } }),
      this.prisma.rentalRequest.count({ where: { status: RentalRequestStatus.PENDING } }),
      this.prisma.contract.count({ where: { status: ContractStatus.ACTIVE } }),
      this.prisma.invoice.count({ where: { status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE, InvoiceStatus.PENDING_CONFIRMATION] } } }),
      this.prisma.servicePackage.count({ where: { isActive: true } }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, fullName: true, role: true, status: true, createdAt: true }
      }),
      this.prisma.rentalRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          seeker: { select: { fullName: true, email: true } },
          room: { select: { name: true } }
        }
      }),
      this.prisma.invoice.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          contract: { select: { room: { select: { name: true } } } }
        }
      })
    ]);

    return {
      totalUsers,
      totalLandlords,
      pendingLandlords,
      totalTenants,
      totalSeekers,
      activeRooms,
      availableRooms,
      rentedRooms,
      pendingRentalRequests,
      activeContracts,
      unpaidInvoices,
      activeServicePackages,
      recentUsers,
      recentRentalRequests,
      recentInvoices
    };
  }

  async listUsers(query: AdminUsersQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { email: { contains: query.search, mode: "insensitive" } },
              { fullName: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          ...safeUserSelect,
          landlordProfile: { select: { id: true, businessName: true, verificationStatus: true } },
          tenantProfile: { select: { id: true } }
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return this.paginate(items, total, page, limit);
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...safeUserSelect,
        landlordProfile: true,
        tenantProfile: true
      }
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateUserStatus(id: string, status: UserStatus, admin: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: safeUserSelect });

      if (!target) {
        throw new NotFoundException("User not found");
      }

      if (target.id === admin.id && blockedStatuses.includes(status)) {
        throw new BadRequestException("Admin cannot lock their own account");
      }

      if (target.role === Role.ADMIN && blockedStatuses.includes(status)) {
        await this.ensureAnotherActiveAdmin(tx, target.id);
      }

      const updated = await tx.user.update({
        where: { id },
        data: {
          status,
          deletedAt: status === UserStatus.DELETED ? new Date() : null
        },
        select: safeUserSelect
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: blockedStatuses.includes(status) ? AdminAuditAction.BAN_USER : AdminAuditAction.UNBAN_USER,
          targetType: "User",
          targetId: id,
          oldValue: { status: target.status },
          newValue: { status }
        }
      });

      return updated;
    });
  }

  async updateUserRole(id: string, role: Role, admin: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.user.findUnique({ where: { id }, select: safeUserSelect });

      if (!target) {
        throw new NotFoundException("User not found");
      }

      if (target.role === Role.ADMIN && role !== Role.ADMIN) {
        await this.ensureAnotherActiveAdmin(tx, target.id);
      }

      const updated = await tx.user.update({
        where: { id },
        data: { role },
        select: safeUserSelect
      });

      if (role === Role.LANDLORD) {
        await tx.landlordProfile.upsert({
          where: { userId: id },
          update: {},
          create: {
            userId: id,
            publicDisplayName: target.fullName,
            publicPhone: target.phone,
            publicEmail: target.email,
            verificationStatus: VerificationStatus.PENDING
          }
        });
      }

      if (role === Role.TENANT) {
        await tx.tenantProfile.upsert({ where: { userId: id }, update: {}, create: { userId: id } });
      }

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: AdminAuditAction.CHANGE_USER_ROLE,
          targetType: "User",
          targetId: id,
          oldValue: { role: target.role },
          newValue: { role }
        }
      });

      return updated;
    });
  }

  async listLandlords(query: AdminLandlordsQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const where: Prisma.LandlordProfileWhereInput = {
      ...(query.verificationStatus ? { verificationStatus: query.verificationStatus } : {}),
      ...(query.search
        ? {
            OR: [
              { publicDisplayName: { contains: query.search, mode: "insensitive" } },
              { publicEmail: { contains: query.search, mode: "insensitive" } },
              { publicPhone: { contains: query.search, mode: "insensitive" } },
              { businessName: { contains: query.search, mode: "insensitive" } },
              { user: { email: { contains: query.search, mode: "insensitive" } } },
              { user: { fullName: { contains: query.search, mode: "insensitive" } } },
              { user: { phone: { contains: query.search, mode: "insensitive" } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      this.prisma.landlordProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: this.landlordInclude()
      }),
      this.prisma.landlordProfile.count({ where })
    ]);

    return this.paginate(items, total, page, limit);
  }

  async listPendingLandlords(query: AdminLandlordsQueryDto) {
    return this.listLandlords({ ...query, verificationStatus: VerificationStatus.PENDING });
  }

  async getLandlord(id: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { id },
      include: {
        ...this.landlordInclude(),
        subscriptions: { include: { servicePackage: true } },
        properties: { take: 10, orderBy: { createdAt: "desc" } }
      }
    });

    if (!landlord) {
      throw new NotFoundException("Landlord not found");
    }

    return landlord;
  }

  async approveLandlord(id: string, admin: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.landlordProfile.findUnique({ where: { id }, include: { user: { select: safeUserSelect } } });

      if (!current) {
        throw new NotFoundException("Landlord not found");
      }

      await tx.landlordProfile.update({
        where: { id },
        data: {
          verificationStatus: VerificationStatus.APPROVED,
          verificationNote: "Approved by admin",
          verifiedAt: new Date(),
          rejectedReason: null
        }
      });

      await tx.user.update({ where: { id: current.userId }, data: { status: UserStatus.ACTIVE } });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: AdminAuditAction.APPROVE_LANDLORD,
          targetType: "LandlordProfile",
          targetId: id,
          oldValue: { verificationStatus: current.verificationStatus, userStatus: current.user.status },
          newValue: { verificationStatus: VerificationStatus.APPROVED, userStatus: UserStatus.ACTIVE }
        }
      });

      return tx.landlordProfile.findUnique({ where: { id }, include: this.landlordInclude() });
    });
  }

  async rejectLandlord(id: string, reason: string, admin: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.landlordProfile.findUnique({ where: { id }, include: { user: { select: safeUserSelect } } });

      if (!current) {
        throw new NotFoundException("Landlord not found");
      }

      await tx.landlordProfile.update({
        where: { id },
        data: {
          verificationStatus: VerificationStatus.REJECTED,
          verificationNote: reason,
          verifiedAt: null,
          rejectedReason: reason
        }
      });

      await tx.user.update({ where: { id: current.userId }, data: { status: UserStatus.SUSPENDED } });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: AdminAuditAction.REJECT_LANDLORD,
          targetType: "LandlordProfile",
          targetId: id,
          oldValue: { verificationStatus: current.verificationStatus, userStatus: current.user.status },
          newValue: { verificationStatus: VerificationStatus.REJECTED, userStatus: UserStatus.SUSPENDED, reason }
        }
      });

      return tx.landlordProfile.findUnique({ where: { id }, include: this.landlordInclude() });
    });
  }

  async listRooms(query: AdminRoomsQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const where: Prisma.RoomWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.regionId ? { regionId: query.regionId } : {}),
      ...(query.landlordId ? { property: { landlordId: query.landlordId } } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { address: { contains: query.search, mode: "insensitive" } },
              { property: { name: { contains: query.search, mode: "insensitive" } } },
              { property: { address: { contains: query.search, mode: "insensitive" } } },
              { property: { landlord: { publicDisplayName: { contains: query.search, mode: "insensitive" } } } },
              { property: { landlord: { user: { fullName: { contains: query.search, mode: "insensitive" } } } } },
              { property: { landlord: { user: { email: { contains: query.search, mode: "insensitive" } } } } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: this.roomInclude()
      }),
      this.prisma.room.count({ where })
    ]);

    return this.paginate(items, total, page, limit);
  }

  async getRoom(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id }, include: this.roomInclude() });

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return room;
  }

  async updateRoomStatus(id: string, status: RoomStatus, admin: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.room.findUnique({ where: { id }, select: { id: true, status: true } });

      if (!current) {
        throw new NotFoundException("Room not found");
      }

      await tx.room.update({ where: { id }, data: { status } });
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: AdminAuditAction.UPDATE_ROOM_STATUS,
          targetType: "Room",
          targetId: id,
          oldValue: { status: current.status },
          newValue: { status }
        }
      });

      return tx.room.findUnique({ where: { id }, include: this.roomInclude() });
    });
  }

  listRoomTypes(query: CategoryQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const where: Prisma.RoomTypeWhereInput = this.roomTypeWhere(query);
    return this.paginatedQuery(
      this.prisma.roomType.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { rooms: true } } } }),
      this.prisma.roomType.count({ where }),
      page,
      limit
    );
  }

  async createRoomType(dto: UpsertCategoryDto, admin: AuthenticatedUser) {
    try {
      const item = await this.prisma.roomType.create({
        data: { name: dto.name, slug: dto.slug ?? this.slugify(dto.name), description: dto.description }
      });
      await this.logAudit(admin.id, AdminAuditAction.CREATE_ROOM_TYPE, "RoomType", item.id, null, item);
      return item;
    } catch (error) {
      this.handleUniqueError(error, "Room type name or slug already exists");
    }
  }

  async updateRoomType(id: string, dto: UpsertCategoryDto, admin: AuthenticatedUser) {
    const oldValue = await this.findRoomTypeOrThrow(id);
    try {
      const item = await this.prisma.roomType.update({
        where: { id },
        data: { name: dto.name, slug: dto.slug ?? this.slugify(dto.name), description: dto.description }
      });
      await this.logAudit(admin.id, AdminAuditAction.UPDATE_ROOM_TYPE, "RoomType", id, oldValue, item);
      return item;
    } catch (error) {
      this.handleUniqueError(error, "Room type name or slug already exists");
    }
  }

  async setRoomTypeActive(id: string, dto: SetActiveDto, admin: AuthenticatedUser) {
    const oldValue = await this.findRoomTypeOrThrow(id);
    const item = await this.prisma.roomType.update({ where: { id }, data: { isActive: dto.isActive ?? false } });
    await this.logAudit(admin.id, AdminAuditAction.DISABLE_ROOM_TYPE, "RoomType", id, oldValue, item);
    return item;
  }

  listAmenities(query: CategoryQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const where: Prisma.AmenityWhereInput = this.amenityWhere(query);
    return this.paginatedQuery(
      this.prisma.amenity.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { _count: { select: { rooms: true } } } }),
      this.prisma.amenity.count({ where }),
      page,
      limit
    );
  }

  async createAmenity(dto: UpsertCategoryDto, admin: AuthenticatedUser) {
    try {
      const item = await this.prisma.amenity.create({
        data: { name: dto.name, slug: dto.slug ?? this.slugify(dto.name), description: dto.description }
      });
      await this.logAudit(admin.id, AdminAuditAction.CREATE_AMENITY, "Amenity", item.id, null, item);
      return item;
    } catch (error) {
      this.handleUniqueError(error, "Amenity name or slug already exists");
    }
  }

  async updateAmenity(id: string, dto: UpsertCategoryDto, admin: AuthenticatedUser) {
    const oldValue = await this.findAmenityOrThrow(id);
    try {
      const item = await this.prisma.amenity.update({
        where: { id },
        data: { name: dto.name, slug: dto.slug ?? this.slugify(dto.name), description: dto.description }
      });
      await this.logAudit(admin.id, AdminAuditAction.UPDATE_AMENITY, "Amenity", id, oldValue, item);
      return item;
    } catch (error) {
      this.handleUniqueError(error, "Amenity name or slug already exists");
    }
  }

  async setAmenityActive(id: string, dto: SetActiveDto, admin: AuthenticatedUser) {
    const oldValue = await this.findAmenityOrThrow(id);
    const item = await this.prisma.amenity.update({ where: { id }, data: { isActive: dto.isActive ?? false } });
    await this.logAudit(admin.id, AdminAuditAction.DISABLE_AMENITY, "Amenity", id, oldValue, item);
    return item;
  }

  listRegions(query: CategoryQueryDto) {
    const { page, limit, skip } = this.getPagination(query);
    const where: Prisma.RegionWhereInput = this.regionWhere(query);
    return this.paginatedQuery(
      this.prisma.region.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { parent: true, _count: { select: { children: true, rooms: true, properties: true } } }
      }),
      this.prisma.region.count({ where }),
      page,
      limit
    );
  }

  async createRegion(dto: UpsertRegionDto, admin: AuthenticatedUser) {
    try {
      const item = await this.prisma.region.create({
        data: { name: dto.name, slug: dto.slug ?? this.slugify(dto.name), parentId: dto.parentId }
      });
      await this.logAudit(admin.id, AdminAuditAction.CREATE_REGION, "Region", item.id, null, item);
      return item;
    } catch (error) {
      this.handleUniqueError(error, "Region slug already exists");
    }
  }

  async updateRegion(id: string, dto: UpsertRegionDto, admin: AuthenticatedUser) {
    const oldValue = await this.findRegionOrThrow(id);
    if (dto.parentId === id) {
      throw new BadRequestException("Region cannot be its own parent");
    }

    try {
      const item = await this.prisma.region.update({
        where: { id },
        data: { name: dto.name, slug: dto.slug ?? this.slugify(dto.name), parentId: dto.parentId ?? null }
      });
      await this.logAudit(admin.id, AdminAuditAction.UPDATE_REGION, "Region", id, oldValue, item);
      return item;
    } catch (error) {
      this.handleUniqueError(error, "Region slug already exists");
    }
  }

  async setRegionActive(id: string, dto: SetActiveDto, admin: AuthenticatedUser) {
    const oldValue = await this.findRegionOrThrow(id);
    const item = await this.prisma.region.update({ where: { id }, data: { isActive: dto.isActive ?? false } });
    await this.logAudit(admin.id, AdminAuditAction.DISABLE_REGION, "Region", id, oldValue, item);
    return item;
  }

  async getReportsOverview() {
    const [
      usersByRole,
      roomsByStatus,
      paymentsByStatus,
      activeContracts,
      unpaidInvoices,
      activeSubscriptions,
      depositsByStatus,
      recentPayments,
      requestRows
    ] = await Promise.all([
      this.prisma.user.groupBy({ by: ["role"], _count: { _all: true }, where: { deletedAt: null } }),
      this.prisma.room.groupBy({ by: ["status"], _count: { _all: true } }),
      this.prisma.payment.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.contract.count({ where: { status: ContractStatus.ACTIVE } }),
      this.prisma.invoice.count({ where: { status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE, InvoiceStatus.PENDING_CONFIRMATION] } } }),
      this.prisma.landlordSubscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.prisma.deposit.groupBy({ by: ["status"], _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.payment.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { invoice: { select: { contract: { select: { room: { select: { name: true } } } } } } }
      }),
      this.prisma.rentalRequest.findMany({
        take: 1000,
        select: { room: { select: { id: true, name: true, region: { select: { id: true, name: true } } } } }
      })
    ]);

    const topRooms = this.topBy(requestRows.map((row) => row.room).filter(Boolean), (room) => room!.id, (room) => room!.name);
    const topRegions = this.topBy(
      requestRows.map((row) => row.room?.region).filter(Boolean),
      (region) => region!.id,
      (region) => region!.name
    );

    return {
      usersByRole: this.countMap(usersByRole, "role"),
      roomsByStatus: this.countMap(roomsByStatus, "status"),
      paymentsByStatus: paymentsByStatus.map((row) => ({ status: row.status, count: row._count._all, amount: row._sum.amount ?? 0 })),
      depositsByStatus: depositsByStatus.map((row) => ({ status: row.status, count: row._count._all, amount: row._sum.amount ?? 0 })),
      activeContracts,
      unpaidInvoices,
      activeSubscriptions,
      topRooms,
      topRegions,
      recentPayments
    };
  }

  private getPagination(query: { page?: number; limit?: number }) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    return { page, limit, skip: (page - 1) * limit };
  }

  private paginate<T>(items: T[], total: number, page: number, limit: number) {
    return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  private async paginatedQuery<T>(itemsPromise: Promise<T[]>, totalPromise: Promise<number>, page: number, limit: number) {
    const [items, total] = await Promise.all([itemsPromise, totalPromise]);
    return this.paginate(items, total, page, limit);
  }

  private async ensureAnotherActiveAdmin(tx: Prisma.TransactionClient, targetAdminId: string) {
    const otherActiveAdmins = await tx.user.count({
      where: {
        id: { not: targetAdminId },
        role: Role.ADMIN,
        deletedAt: null,
        status: { notIn: blockedStatuses }
      }
    });

    if (otherActiveAdmins === 0) {
      throw new BadRequestException("Cannot lock or demote the last active admin");
    }
  }

  private landlordInclude() {
    return {
      user: { select: safeUserSelect },
      _count: { select: { properties: true, contracts: true, subscriptions: true } }
    } satisfies Prisma.LandlordProfileInclude;
  }

  private roomInclude() {
    return {
      property: {
        include: {
          landlord: { include: { user: { select: safeUserSelect } } },
          region: true
        }
      },
      region: true,
      roomType: true,
      images: { orderBy: { sortOrder: "asc" } },
      amenities: { include: { amenity: true } },
      _count: { select: { rentalRequests: true, contracts: true, reviews: true } }
    } satisfies Prisma.RoomInclude;
  }

  private roomTypeWhere(query: CategoryQueryDto): Prisma.RoomTypeWhereInput {
    return {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { slug: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };
  }

  private amenityWhere(query: CategoryQueryDto): Prisma.AmenityWhereInput {
    return {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { slug: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };
  }

  private regionWhere(query: CategoryQueryDto): Prisma.RegionWhereInput {
    return {
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { slug: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };
  }

  private async findRoomTypeOrThrow(id: string) {
    const item = await this.prisma.roomType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Room type not found");
    return item;
  }

  private async findAmenityOrThrow(id: string) {
    const item = await this.prisma.amenity.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Amenity not found");
    return item;
  }

  private async findRegionOrThrow(id: string) {
    const item = await this.prisma.region.findUnique({ where: { id } });
    if (!item) throw new NotFoundException("Region not found");
    return item;
  }

  private async logAudit(
    adminId: string,
    action: AdminAuditAction,
    targetType: string,
    targetId: string | null,
    oldValue: unknown,
    newValue: unknown
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        oldValue: this.toJson(oldValue),
        newValue: this.toJson(newValue)
      }
    });
  }


  private toJson(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
  private slugify(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
  }

  private handleUniqueError(error: unknown, message: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new ConflictException(message);
    }

    throw error;
  }

  private countMap<T extends Record<string, unknown>>(rows: Array<T & { _count: { _all: number } }>, key: keyof T) {
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[String(row[key])] = row._count._all;
      return acc;
    }, {});
  }

  private topBy<T>(items: T[], keyFn: (item: T) => string, labelFn: (item: T) => string) {
    const map = new Map<string, { id: string; name: string; count: number }>();

    for (const item of items) {
      const id = keyFn(item);
      const current = map.get(id);
      if (current) {
        current.count += 1;
      } else {
        map.set(id, { id, name: labelFn(item), count: 1 });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }
}
