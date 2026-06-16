import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCoTenantDto } from "./dto/create-co-tenant.dto";

@Injectable()
export class CoTenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(landlordUserId: string, dto: CreateCoTenantDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const contract = await this.prisma.contract.findFirst({
      where: {
        id: dto.contractId,
        landlordId: landlord.id,
      },
    });

    if (!contract) {
      throw new NotFoundException("Contract not found or you do not have permission");
    }

    return this.prisma.coTenant.create({
      data: {
        contractId: dto.contractId,
        fullName: dto.fullName,
        phone: dto.phone,
        identityNumber: dto.identityNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        relationship: dto.relationship,
      },
    });
  }

  async remove(landlordUserId: string, id: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const coTenant = await this.prisma.coTenant.findFirst({
      where: {
        id,
        contract: { landlordId: landlord.id },
      },
    });

    if (!coTenant) {
      throw new NotFoundException("Co-tenant not found");
    }

    return this.prisma.coTenant.delete({
      where: { id },
    });
  }
}
