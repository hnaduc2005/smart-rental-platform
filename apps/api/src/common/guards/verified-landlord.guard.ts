import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Role, UserStatus, VerificationStatus } from "@smart-rental/database";
import { PrismaService } from "../../modules/prisma/prisma.service";
import { AuthenticatedRequest } from "../types/authenticated-user";

const LANDLORD_NOT_VERIFIED_MESSAGE =
  "Landlord account must be active and approved before managing properties or rooms";

@Injectable()
export class VerifiedLandlordGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user || user.role !== Role.LANDLORD || user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(LANDLORD_NOT_VERIFIED_MESSAGE);
    }

    const landlord = await this.prisma.landlordProfile.findUnique({
      where: { userId: user.id },
      select: { verificationStatus: true }
    });

    if (landlord?.verificationStatus !== VerificationStatus.APPROVED) {
      throw new ForbiddenException(LANDLORD_NOT_VERIFIED_MESSAGE);
    }

    return true;
  }
}
