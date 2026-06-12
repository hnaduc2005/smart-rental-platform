import { Injectable } from "@nestjs/common";
import { Prisma, RoomStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

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

  create(data: Prisma.RoomCreateInput) {
    return this.prisma.room.create({ data });
  }

  updateStatus(id: string, status: RoomStatus) {
    return this.prisma.room.update({
      where: { id },
      data: { status }
    });
  }
}
