import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenantProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          }
        }
      }
    });
  }

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) return [];

    return this.prisma.tenantProfile.findMany({
      where: {
        contracts: {
          some: { landlordId: landlord.id }
        }
      },
      include: {
        user: { select: { fullName: true, phone: true } },
        contracts: {
          where: { landlordId: landlord.id },
          include: { room: { include: { property: true } } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }
}
