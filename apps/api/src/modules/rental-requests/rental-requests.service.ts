import { Injectable, NotFoundException } from "@nestjs/common";
import { RentalRequestStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateRentalRequestStatusDto } from "./dto/update-rental-request-status.dto";

@Injectable()
export class RentalRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    return this.prisma.rentalRequest.findMany({
      where: {
        room: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
      include: {
        seeker: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        room: {
          select: { id: true, name: true, property: { select: { id: true, name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(landlordUserId: string, requestId: string, dto: UpdateRentalRequestStatusDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const request = await this.prisma.rentalRequest.findFirst({
      where: {
        id: requestId,
        room: {
          property: {
            landlordId: landlord.id,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException("Rental request not found or you do not have permission to modify it");
    }

    return this.prisma.rentalRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        ...(dto.status === RentalRequestStatus.APPROVED ? { approvedAt: new Date() } : {})
      },
      include: {
        seeker: {
          select: { id: true, fullName: true, email: true, phone: true }
        },
        room: {
          select: { id: true, name: true }
        }
      }
    });
  }
}
