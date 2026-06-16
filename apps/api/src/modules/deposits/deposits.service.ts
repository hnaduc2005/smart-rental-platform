import { Injectable, NotFoundException } from "@nestjs/common";
import { DepositStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateDepositStatusDto } from "./dto/update-deposit-status.dto";

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    return this.prisma.deposit.findMany({
      where: {
        OR: [
          { contract: { landlordId: landlord.id } },
          { rentalRequest: { room: { property: { landlordId: landlord.id } } } },
        ],
      },
      include: {
        contract: { select: { id: true, code: true, room: { select: { name: true } } } },
        rentalRequest: { select: { id: true, room: { select: { name: true } }, seeker: { select: { fullName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(landlordUserId: string, depositId: string, dto: UpdateDepositStatusDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const deposit = await this.prisma.deposit.findFirst({
      where: {
        id: depositId,
        OR: [
          { contract: { landlordId: landlord.id } },
          { rentalRequest: { room: { property: { landlordId: landlord.id } } } },
        ],
      },
    });

    if (!deposit) {
      throw new NotFoundException("Deposit not found");
    }

    const isConfirmed = dto.status === DepositStatus.PAID;

    return this.prisma.deposit.update({
      where: { id: depositId },
      data: {
        status: dto.status,
        rejectedReason: dto.rejectedReason,
        confirmedAt: isConfirmed ? new Date() : undefined,
      },
      include: {
        contract: { select: { id: true, code: true } },
        rentalRequest: { select: { id: true } },
      },
    });
  }
}
