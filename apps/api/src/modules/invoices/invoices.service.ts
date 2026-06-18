import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from "./dto/invoices.dto";

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    return this.prisma.invoice.findMany({
      where: { contract: { landlordId: landlord.id } },
      include: {
        contract: {
          select: {
            id: true,
            code: true,
            room: { select: { name: true, property: { select: { name: true } } } },
            tenantProfile: { select: { user: { select: { fullName: true } } } },
          },
        },
        payments: true,
      },
      orderBy: { billingMonth: "desc" },
    });
  }

  async getForTenant(tenantUserId: string) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId },
    });
    if (!tenant) {
      return []; // Return empty array for Seekers without a tenant profile
    }

    return this.prisma.invoice.findMany({
      where: { contract: { tenantProfileId: tenant.id } },
      include: {
        contract: {
          select: {
            room: { select: { name: true, property: { select: { name: true } } } },
            landlord: { select: { 
              user: { select: { fullName: true, phone: true } },
              bankName: true,
              bankAccountNumber: true,
              bankAccountName: true
            } },
          },
        },
        payments: true
      },
      orderBy: { billingMonth: "desc" },
    });
  }

  async createInvoice(landlordUserId: string, dto: CreateInvoiceDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    // Verify contract belongs to landlord
    const contract = await this.prisma.contract.findFirst({
      where: {
        id: dto.contractId,
        landlordId: landlord.id,
      },
    });

    if (!contract) {
      throw new NotFoundException("Contract not found or you do not have permission");
    }

    const totalAmount =
      dto.roomAmount + dto.electricAmount + dto.waterAmount + dto.serviceAmount;

    return this.prisma.invoice.create({
      data: {
        contractId: dto.contractId,
        billingMonth: new Date(dto.billingMonth),
        dueDate: new Date(dto.dueDate),
        roomAmount: dto.roomAmount,
        electricAmount: dto.electricAmount,
        waterAmount: dto.waterAmount,
        serviceAmount: dto.serviceAmount,
        totalAmount,
      },
    });
  }

  async updateStatus(landlordUserId: string, invoiceId: string, dto: UpdateInvoiceStatusDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        contract: { landlordId: landlord.id },
      },
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: dto.status },
      });

      // Nếu hóa đơn được đánh dấu là Đã thanh toán, tự động xác nhận các giao dịch thanh toán chờ xử lý
      if (dto.status === "PAID") {
        await tx.payment.updateMany({
          where: {
            invoiceId: invoiceId,
            status: "PENDING",
          },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });
      }

      return updatedInvoice;
    });
  }
}
