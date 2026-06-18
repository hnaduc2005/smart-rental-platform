import { Injectable } from "@nestjs/common";
import { AdminAuditAction, UserStatus, VerificationStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LandlordsService {
  constructor(private readonly prisma: PrismaService) {}

  findPending() {
    return this.prisma.landlordProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: { user: true },
      orderBy: { createdAt: "asc" }
    });
  }

  getMyProfile(userId: string) {
    return this.prisma.landlordProfile.findUnique({
      where: { userId },
      include: { user: { select: { fullName: true, phone: true, email: true } } }
    });
  }

  async updateMyProfile(userId: string, data: { bankName?: string; bankAccountNumber?: string; bankAccountName?: string }) {
    return this.prisma.landlordProfile.update({
      where: { userId },
      data: {
        bankName: data.bankName,
        bankAccountNumber: data.bankAccountNumber,
        bankAccountName: data.bankAccountName
      }
    });
  }

  findById(id: string) {
    return this.prisma.landlordProfile.findUnique({
      where: { id },
      include: {
        user: true,
        properties: true,
        subscriptions: {
          include: { servicePackage: true }
        }
      }
    });
  }

  approve(id: string, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const landlord = await tx.landlordProfile.update({
        where: { id },
        data: {
          verificationStatus: VerificationStatus.APPROVED,
          verifiedAt: new Date(),
          rejectedReason: null
        }
      });

      await tx.user.update({
        where: { id: landlord.userId },
        data: { status: UserStatus.ACTIVE }
      });

      if (adminId) {
        await tx.adminAuditLog.create({
          data: {
            adminId,
            action: AdminAuditAction.APPROVE_LANDLORD,
            targetType: "LandlordProfile",
            targetId: landlord.id,
            newValue: { verificationStatus: VerificationStatus.APPROVED }
          }
        });
      }

      return tx.landlordProfile.findUnique({
        where: { id },
        include: { user: true }
      });
    });
  }

  reject(id: string, rejectedReason: string, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const landlord = await tx.landlordProfile.update({
        where: { id },
        data: {
          verificationStatus: VerificationStatus.REJECTED,
          verifiedAt: null,
          rejectedReason
        }
      });

      await tx.user.update({
        where: { id: landlord.userId },
        data: { status: UserStatus.SUSPENDED }
      });

      if (adminId) {
        await tx.adminAuditLog.create({
          data: {
            adminId,
            action: AdminAuditAction.REJECT_LANDLORD,
            targetType: "LandlordProfile",
            targetId: landlord.id,
            newValue: {
              verificationStatus: VerificationStatus.REJECTED,
              rejectedReason
            }
          }
        });
      }

      return tx.landlordProfile.findUnique({
        where: { id },
        include: { user: true }
      });
    });
  }
}
