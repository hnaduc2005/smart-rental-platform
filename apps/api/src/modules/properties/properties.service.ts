import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { Prisma, PropertyStatus, RoomStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { publicUserSelect } from "../../common/selects/safe-user.select";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async getLandlordProfileOrThrow(userId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId },
    });
    if (!landlord) {
      throw new ForbiddenException("Landlord profile not found for this user");
    }
    return landlord;
  }

  findMany(args: Prisma.PropertyFindManyArgs = {}) {
    const defaultInclude = args.select
      ? undefined
      : args.include ?? {
          landlord: {
            include: { user: { select: publicUserSelect } }
          },
          region: true,
          rooms: true
        };

    return this.prisma.property.findMany({
      ...args,
      ...(defaultInclude ? { include: defaultInclude } : {})
    });
  }

  async findMyProperties(userId: string) {
    const landlord = await this.getLandlordProfileOrThrow(userId);
    return this.prisma.property.findMany({
      where: {
        landlordId: landlord.id,
        status: { not: PropertyStatus.DELETED },
      },
      include: {
        region: true,
        rooms: {
          where: { status: { not: RoomStatus.HIDDEN } }
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          include: { user: { select: publicUserSelect } }
        },
        region: true,
        rooms: {
          include: {
            roomType: true,
            images: true
          }
        }
      }
    });
  }

  async createForLandlord(userId: string, dto: CreatePropertyDto) {
    const landlord = await this.getLandlordProfileOrThrow(userId);
    return this.prisma.property.create({
      data: {
        name: dto.name,
        address: dto.address,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        landlord: {
          connect: { id: landlord.id },
        },
        ...(dto.regionId ? { region: { connect: { id: dto.regionId } } } : {}),
      },
    });
  }

  async updateForLandlord(id: string, userId: string, dto: UpdatePropertyDto) {
    const landlord = await this.getLandlordProfileOrThrow(userId);
    
    // Check ownership
    const property = await this.prisma.property.findFirst({
      where: { id, landlordId: landlord.id },
    });
    if (!property) {
      throw new NotFoundException("Property not found or you do not have permission to edit it");
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        ...(dto.regionId ? { region: { connect: { id: dto.regionId } } } : {}),
      },
    });
  }

  async deleteForLandlord(id: string, userId: string) {
    const landlord = await this.getLandlordProfileOrThrow(userId);

    // Check ownership
    const property = await this.prisma.property.findFirst({
      where: { id, landlordId: landlord.id },
    });
    if (!property) {
      throw new NotFoundException("Property not found or you do not have permission to delete it");
    }

    return this.prisma.property.update({
      where: { id },
      data: { status: PropertyStatus.DELETED },
    });
  }

  updateStatus(id: string, status: PropertyStatus) {
    return this.prisma.property.update({
      where: { id },
      data: { status }
    });
  }
}

