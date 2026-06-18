import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateIssueStatusDto } from "./dto/update-issue-status.dto";
import { CreateIssueDto } from "./dto/create-issue.dto";

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantUserId: string, dto: CreateIssueDto) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId }
    });
    if (!tenant) {
      throw new NotFoundException("Tenant profile not found");
    }

    return this.prisma.issueReport.create({
      data: {
        tenantProfileId: tenant.id,
        roomId: dto.roomId,
        contractId: dto.contractId,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
      }
    });
  }

  async getForTenant(tenantUserId: string) {
    const tenant = await this.prisma.tenantProfile.findUnique({
      where: { userId: tenantUserId }
    });
    if (!tenant) {
      return [];
    }

    return this.prisma.issueReport.findMany({
      where: { tenantProfileId: tenant.id },
      include: {
        room: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getForLandlord(landlordUserId: string) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    return this.prisma.issueReport.findMany({
      where: { contract: { landlordId: landlord.id } },
      include: {
        contract: {
          select: {
            room: { select: { name: true, property: { select: { name: true } } } },
            tenantProfile: { select: { user: { select: { fullName: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(landlordUserId: string, issueId: string, dto: UpdateIssueStatusDto) {
    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: landlordUserId },
    });
    if (!landlord) {
      throw new NotFoundException("Landlord profile not found");
    }

    const issue = await this.prisma.issueReport.findFirst({
      where: {
        id: issueId,
        contract: { landlordId: landlord.id },
      },
    });

    if (!issue) {
      throw new NotFoundException("Issue report not found");
    }

    return this.prisma.issueReport.update({
      where: { id: issueId },
      data: { status: dto.status },
    });
  }
}
