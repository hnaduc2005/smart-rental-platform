import { Injectable } from "@nestjs/common";
import { Prisma, Role, UserStatus } from "@smart-rental/database";
import bcrypt from "bcryptjs";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PrismaService } from "../prisma/prisma.service";

const userProfileInclude = {
  landlordProfile: true,
  tenantProfile: true
} satisfies Prisma.UserInclude;

const blockedUserStatuses: UserStatus[] = [
  UserStatus.LOCKED,
  UserStatus.SUSPENDED,
  UserStatus.DELETED
];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: userProfileInclude
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: userProfileInclude
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
      include: userProfileInclude
    });
  }

  createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
      include: userProfileInclude
    });
  }

  create(data: Prisma.UserCreateInput) {
    return this.createUser(data);
  }

  updateStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status }
    });
  }

  updateRole(id: string, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role }
    });
  }

  updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      include: userProfileInclude
    });
  }

  async validateUserPassword(email: string, password: string) {
    const user = await this.findByEmail(email);

    if (!user?.passwordHash) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    return isValidPassword ? user : null;
  }

  isAccountBlocked(user: { status: UserStatus; deletedAt?: Date | null }) {
    return (
      user.deletedAt !== null && user.deletedAt !== undefined
    ) || blockedUserStatuses.includes(user.status);
  }

  getSafeUser(user: {
    id: string;
    email: string;
    phone: string | null;
    fullName: string | null;
    role: Role;
    status: UserStatus;
  }): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      status: user.status
    };
  }
}
