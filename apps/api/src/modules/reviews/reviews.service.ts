import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantUserId: string, dto: CreateReviewDto) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId }
    });
    if (!tenant) throw new NotFoundException("Tenant not found");

    // Validate room exists and find its landlord
    const room = await this.prisma.room.findUnique({
      where: { id: dto.roomId },
      include: { property: true }
    });
    if (!room) throw new NotFoundException("Room not found");

    // Check if review already exists for this room by this tenant
    const existingReview = await this.prisma.review.findFirst({
      where: {
        tenantProfileId: tenant.id,
        roomId: dto.roomId,
        contractId: dto.contractId || null
      }
    });

    if (existingReview) {
      throw new BadRequestException("You have already reviewed this room for this contract.");
    }

    return this.prisma.review.create({
      data: {
        tenantProfileId: tenant.id,
        roomId: dto.roomId,
        landlordId: room.property.landlordId,
        contractId: dto.contractId,
        rating: dto.rating,
        comment: dto.comment,
      }
    });
  }

  async getForTenant(tenantUserId: string) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId }
    });
    if (!tenant) return [];

    return this.prisma.review.findMany({
      where: { tenantProfileId: tenant.id },
      include: {
        room: { select: { name: true, property: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
