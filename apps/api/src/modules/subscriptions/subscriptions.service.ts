import { Injectable } from "@nestjs/common";
import { Prisma, SubscriptionStatus } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  findByLandlord(landlordId: string) {
    return this.prisma.landlordSubscription.findMany({
      where: { landlordId },
      include: { servicePackage: true },
      orderBy: { endsAt: "desc" }
    });
  }

  create(data: Prisma.LandlordSubscriptionCreateInput) {
    return this.prisma.landlordSubscription.create({ data });
  }

  updateStatus(id: string, status: SubscriptionStatus) {
    return this.prisma.landlordSubscription.update({
      where: { id },
      data: { status }
    });
  }
}
