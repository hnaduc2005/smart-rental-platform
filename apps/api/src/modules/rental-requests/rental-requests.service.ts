import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { RentalRequestStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateRentalRequestStatusDto } from "./dto/update-rental-request-status.dto";
import { CreateRentalRequestDto } from "./dto/create-rental-request.dto";

@Injectable()
export class RentalRequestsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(seekerUserId: string, dto: CreateRentalRequestDto) {
    const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return this.prisma.rentalRequest.create({
      data: {
        roomId: dto.roomId,
        seekerId: seekerUserId,
        message: dto.message,
      }
    });
  }

  async getForSeeker(seekerUserId: string) {
    return this.prisma.rentalRequest.findMany({
      where: { seekerId: seekerUserId },
      include: {
        room: {
          select: { id: true, name: true, property: { select: { id: true, name: true, landlord: { select: { publicDisplayName: true, publicPhone: true } } } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    try {
      return await this.prisma.rentalRequest.findMany({
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
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || "Prisma Error in getForLandlord");
    }
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

    const updatedRequest = await this.prisma.rentalRequest.update({
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

    // Tự động tạo TenantProfile cho Seeker nếu được Approve và chưa có profile
    if (dto.status === RentalRequestStatus.APPROVED) {
      const seekerId = updatedRequest.seeker.id;
      const existingProfile = await this.prisma.tenantProfile.findUnique({
        where: { userId: seekerId }
      });
      
      if (!existingProfile) {
        await this.prisma.tenantProfile.create({
          data: { userId: seekerId }
        });
      }
    }

    return updatedRequest;
  }
}
