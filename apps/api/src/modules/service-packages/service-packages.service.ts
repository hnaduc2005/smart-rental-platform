import { Injectable } from "@nestjs/common";
import { Prisma } from "@smart-rental/database";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ServicePackagesService {
  constructor(private readonly prisma: PrismaService) {}

  findMany(args: Prisma.ServicePackageFindManyArgs = {}) {
    return this.prisma.servicePackage.findMany({
      ...args,
      orderBy: args.orderBy ?? { price: "asc" }
    });
  }

  create(data: Prisma.ServicePackageCreateInput) {
    return this.prisma.servicePackage.create({ data });
  }

  update(id: string, data: Prisma.ServicePackageUpdateInput) {
    return this.prisma.servicePackage.update({
      where: { id },
      data
    });
  }

  disable(id: string) {
    return this.prisma.servicePackage.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
