import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantUserId: string, dto: CreatePaymentDto) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId }
    });
    if (!tenant) throw new NotFoundException("Tenant not found");

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          paymentMethodId: dto.paymentMethodId,
          proofImageUrl: dto.proofImageUrl,
          status: "PENDING"
        }
      });

      // Update invoice status to partially paid or processing
      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: "PENDING_CONFIRMATION" }
      });

      return payment;
    });
  }

  async getForTenant(tenantUserId: string) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId }
    });
    if (!tenant) return [];

    return this.prisma.payment.findMany({
      where: { invoice: { contract: { tenantProfileId: tenant.id } } },
      include: {
        invoice: { select: { billingMonth: true, totalAmount: true } },
      },
      orderBy: { createdAt: "desc" }
    });
  }
}
