import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { ContractStatus, RoomStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateContractDto, UpdateContractStatusDto } from "./dto/contracts.dto";

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    return this.prisma.contract.findMany({
      where: { landlordId: landlord.id },
      include: {
        room: { select: { id: true, name: true, property: { select: { name: true } } } },
        tenantProfile: { select: { id: true, user: { select: { fullName: true, phone: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createContract(landlordUserId: string, dto: CreateContractDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    // Verify room belongs to landlord
    const room = await this.prisma.room.findFirst({
      where: {
        id: dto.roomId,
        property: { landlordId: landlord.id },
      },
    });

    if (!room) {
      throw new NotFoundException("Room not found or you do not own this property");
    }

    if (room.status === RoomStatus.RENTED) {
      throw new BadRequestException("This room is already rented");
    }

    return this.prisma.contract.create({
      data: {
        roomId: dto.roomId,
        tenantProfileId: dto.tenantProfileId,
        landlordId: landlord.id,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        rentAmount: dto.rentAmount,
        depositAmount: dto.depositAmount,
        paymentDueDay: dto.paymentDueDay,
        notes: dto.notes,
        rentalRequestId: dto.rentalRequestId,
        status: ContractStatus.DRAFT,
      },
    });
  }

  async updateStatus(landlordUserId: string, contractId: string, dto: UpdateContractStatusDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        landlordId: landlord.id,
      },
    });

    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    if (dto.status === ContractStatus.ACTIVE) {
      // Check if room is already active in another contract
      const activeContract = await this.prisma.contract.findUnique({
        where: { activeRoomId: contract.roomId },
      });

      if (activeContract && activeContract.id !== contractId) {
        throw new BadRequestException("Room already has an active contract");
      }

      return this.prisma.$transaction(async (tx) => {
        const updatedContract = await tx.contract.update({
          where: { id: contractId },
          data: {
            status: ContractStatus.ACTIVE,
            activeRoomId: contract.roomId,
          },
        });

        await tx.room.update({
          where: { id: contract.roomId },
          data: { status: RoomStatus.RENTED },
        });

        return updatedContract;
      });
    }

    if (
      dto.status === ContractStatus.ENDED ||
      dto.status === ContractStatus.TERMINATED ||
      dto.status === ContractStatus.EXPIRED
    ) {
      return this.prisma.$transaction(async (tx) => {
        const updatedContract = await tx.contract.update({
          where: { id: contractId },
          data: {
            status: dto.status,
            activeRoomId: null, // Free the room
          },
        });

        await tx.room.update({
          where: { id: contract.roomId },
          data: { status: RoomStatus.AVAILABLE },
        });

        return updatedContract;
      });
    }

    // Default update for other statuses
    return this.prisma.contract.update({
      where: { id: contractId },
      data: { status: dto.status },
    });
  }
}
