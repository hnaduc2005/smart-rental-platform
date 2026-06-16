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
            code: true,
            room: { select: { name: true, property: { select: { name: true } } } },
            tenantProfile: { select: { user: { select: { fullName: true } } } },
          },
        },
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

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: dto.status },
    });
  }
}
