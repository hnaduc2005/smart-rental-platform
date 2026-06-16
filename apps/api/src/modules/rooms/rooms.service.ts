import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { Prisma, RoomStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getLandlordProfileOrThrow(userId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId },
    });
    if (!landlord) {
      throw new ForbiddenException("Landlord profile not found for this user");
    }
    return landlord;
  }

  findMany(args: Prisma.RoomFindManyArgs = {}) {
    const defaultInclude = args.select
      ? undefined
      : args.include ?? {
          property: {
            include: {
              landlord: {
                include: { user: true }
              }
            }
          },
          region: true,
          roomType: true,
          images: {
            orderBy: { sortOrder: "asc" }
          },
          amenities: {
            include: { amenity: true }
          }
        };

    return this.prisma.room.findMany({
      ...args,
      ...(defaultInclude ? { include: defaultInclude } : {})
    });
  }

  async findMyRooms(userId: string) {
    const landlord = await this.getLandlordProfileOrThrow(userId);
    return this.prisma.room.findMany({
      where: {
        property: { landlordId: landlord.id },
        status: { not: RoomStatus.HIDDEN },
      },
      include: {
        property: true,
        roomType: true,
        images: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            landlord: {
              include: { user: true }
            }
          }
        },
        region: true,
        roomType: true,
        images: {
          orderBy: { sortOrder: "asc" }
        },
        amenities: {
          include: { amenity: true }
        },
        activeContract: true
      }
    });
  }

  async createForLandlord(userId: string, dto: CreateRoomDto) {
    const landlord = await this.getLandlordProfileOrThrow(userId);

    // Verify ownership of the property
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, landlordId: landlord.id },
    });
    if (!property) {
      throw new ForbiddenException("Property not found or you do not own it");
    }

    return this.prisma.room.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        area: dto.area,
        address: dto.address,
        rules: dto.rules,
        maxOccupants: dto.maxOccupants,
        status: dto.status ?? RoomStatus.AVAILABLE,
        publicContactName: dto.publicContactName,
        publicContactPhone: dto.publicContactPhone,
        latitude: dto.latitude,
        longitude: dto.longitude,
        property: { connect: { id: dto.propertyId } },
        ...(dto.roomTypeId ? { roomType: { connect: { id: dto.roomTypeId } } } : {}),
        ...(dto.regionId ? { region: { connect: { id: dto.regionId } } } : {}),
        ...(dto.amenityIds && dto.amenityIds.length > 0 
            ? { amenities: { create: dto.amenityIds.map(id => ({ amenityId: id })) } } 
            : {}),
        ...(dto.images && dto.images.length > 0
            ? { images: { create: dto.images.map((url, index) => ({ url, sortOrder: index })) } }
            : {}),
      },
      include: {
        images: true,
        amenities: true
      }
    });
  }

  async updateForLandlord(id: string, userId: string, dto: UpdateRoomDto) {
    const landlord = await this.getLandlordProfileOrThrow(userId);

    // Verify ownership of the room (via its property)
    const room = await this.prisma.room.findFirst({
      where: { id, property: { landlordId: landlord.id } },
    });
    if (!room) {
      throw new NotFoundException("Room not found or you do not have permission to edit it");
    }

    // If changing propertyId, verify ownership of the new property
    if (dto.propertyId && dto.propertyId !== room.propertyId) {
      const newProperty = await this.prisma.property.findFirst({
        where: { id: dto.propertyId, landlordId: landlord.id },
      });
      if (!newProperty) {
        throw new ForbiddenException("New property not found or you do not own it");
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        area: dto.area,
        address: dto.address,
        rules: dto.rules,
        maxOccupants: dto.maxOccupants,
        status: dto.status,
        publicContactName: dto.publicContactName,
        publicContactPhone: dto.publicContactPhone,
        latitude: dto.latitude,
        longitude: dto.longitude,
        ...(dto.propertyId ? { property: { connect: { id: dto.propertyId } } } : {}),
        ...(dto.roomTypeId ? { roomType: { connect: { id: dto.roomTypeId } } } : {}),
        ...(dto.regionId ? { region: { connect: { id: dto.regionId } } } : {}),
        ...(dto.amenityIds
            ? { 
                amenities: { 
                  deleteMany: {}, 
                  create: dto.amenityIds.map(id => ({ amenityId: id })) 
                } 
              } 
            : {}),
        ...(dto.images
            ? { 
                images: { 
                  deleteMany: {}, 
                  create: dto.images.map((url, index) => ({ url, sortOrder: index })) 
                } 
              }
            : {}),
      },
      include: {
        images: true,
        amenities: true
      }
    });
  }

  async deleteForLandlord(id: string, userId: string) {
    const landlord = await this.getLandlordProfileOrThrow(userId);

    // Verify ownership
    const room = await this.prisma.room.findFirst({
      where: { id, property: { landlordId: landlord.id } },
    });
    if (!room) {
      throw new NotFoundException("Room not found or you do not have permission to delete it");
    }

    // Soft delete by setting status to HIDDEN
    return this.prisma.room.update({
      where: { id },
      data: { status: RoomStatus.HIDDEN },
    });
  }

  updateStatus(id: string, status: RoomStatus) {
    return this.prisma.room.update({
      where: { id },
      data: { status }
    });
  }
}
