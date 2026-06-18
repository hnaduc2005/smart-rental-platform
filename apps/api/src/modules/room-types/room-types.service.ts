import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RoomTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.roomType.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
