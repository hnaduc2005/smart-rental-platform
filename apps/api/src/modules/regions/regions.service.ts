import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllProvinces() {
    return this.prisma.region.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
    });
  }

  async findDistrictsByProvince(provinceId: string) {
    return this.prisma.region.findMany({
      where: { parentId: provinceId },
      orderBy: { name: 'asc' },
    });
  }
}
