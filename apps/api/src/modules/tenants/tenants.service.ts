import { Injectable } from "@nestjs/common";
import { RentalRequestStatus } from "@smart-rental/database";
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
        OR: [
          {
            contracts: {
              some: { landlordId: landlord.id }
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
                          is: { landlordId: landlord.id }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        user: { select: { fullName: true, phone: true, email: true } },
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
