import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateIssueStatusDto } from "./dto/update-issue-status.dto";

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

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
