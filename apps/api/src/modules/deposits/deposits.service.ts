import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DepositStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateDepositStatusDto } from "./dto/update-deposit-status.dto";
import { CreateDepositDto } from "./dto/create-deposit.dto";

@Injectable()
export class DepositsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDeposit(userId: string, dto: CreateDepositDto) {
    if (!dto.rentalRequestId && !dto.contractId) {
      throw new BadRequestException("Phải chỉ định rentalRequestId hoặc contractId");
    }

    // Xác thực người dùng (Seeker hoặc Tenant) có quyền tạo cọc không
    // (Giản lược ở mức này, nếu có thời gian nên check quyền sở hữu rentalRequest/contract)

    return this.prisma.deposit.create({
      data: {
        rentalRequestId: dto.rentalRequestId,
        contractId: dto.contractId,
        amount: dto.amount,
        status: DepositStatus.PENDING_CONFIRMATION,
        proofImageUrl: dto.proofImageUrl,
      },
    });
  }

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

    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái của khoản tiền cọc
      const updatedDeposit = await tx.deposit.update({
        where: { id: depositId },
        data: {
          status: dto.status,
          rejectedReason: dto.rejectedReason,
          confirmedAt: isConfirmed ? new Date() : undefined,
        },
        include: {
          contract: { select: { id: true, code: true, roomId: true } },
          rentalRequest: { select: { id: true, roomId: true } },
        },
      });

      // 2. Tự động hoá: Cập nhật các bảng liên quan nếu cọc được xác nhận (PAID)
      if (isConfirmed) {
        // Trường hợp A: Đây là cọc giữ chỗ (Từ Yêu cầu thuê)
        if (updatedDeposit.rentalRequestId && updatedDeposit.rentalRequest) {
          await tx.rentalRequest.update({
            where: { id: updatedDeposit.rentalRequestId },
            data: { status: "APPROVED", approvedAt: new Date() },
          });

          await tx.room.update({
            where: { id: updatedDeposit.rentalRequest.roomId },
            data: { status: "DEPOSITED" }, // Chuyển phòng sang trạng thái Đã cọc
          });
        }
        // Trường hợp B: Đây là cọc hợp đồng (Từ Hợp đồng thuê)
        else if (updatedDeposit.contractId && updatedDeposit.contract) {
          await tx.contract.update({
            where: { id: updatedDeposit.contractId },
            data: { 
              status: "ACTIVE", // Kích hoạt hợp đồng
              activeRoomId: updatedDeposit.contract.roomId // Ràng buộc mỗi phòng 1 hợp đồng active
            },
          });

          await tx.room.update({
            where: { id: updatedDeposit.contract.roomId },
            data: { status: "RENTED" }, // Chuyển phòng sang trạng thái Đã cho thuê
          });
        }
      }

      return updatedDeposit;
    });
  }
}
