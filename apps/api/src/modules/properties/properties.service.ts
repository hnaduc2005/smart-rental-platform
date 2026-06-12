import { Injectable } from "@nestjs/common";
import { Prisma, PropertyStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.PropertyFindManyArgs = {}) {
    const defaultInclude = args.select
      ? undefined
      : args.include ?? {
          landlord: {
            include: { user: true }
          },
          region: true,
          rooms: true
        };

    return this.prisma.property.findMany({
      ...args,
      ...(defaultInclude ? { include: defaultInclude } : {})
    });
  }

  findById(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          include: { user: true }
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

  create(data: Prisma.PropertyCreateInput) {
    return this.prisma.property.create({ data });
  }

  updateStatus(id: string, status: PropertyStatus) {
    return this.prisma.property.update({
      where: { id },
      data: { status }
    });
  }
}
