import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, Role, UserStatus, VerificationStatus } from "@smart-rental/database";
import bcrypt from "bcryptjs";
import { AuthenticatedUser, JwtPayload } from "../../common/types/authenticated-user";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async register(registerDto: RegisterDto) {
    const role = registerDto.role ?? Role.SEEKER;

    if (role === Role.ADMIN) {
      throw new BadRequestException("Không được phép đăng ký tài khoản ADMIN từ giao diện công khai");
    }

    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException("Email này đã được sử dụng");
    }

    if (registerDto.phone) {
      const existingPhone = await this.usersService.findByPhone(registerDto.phone);

      if (existingPhone) {
        throw new ConflictException("Số điện thoại này đã được sử dụng");
      }
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const status = role === Role.LANDLORD ? UserStatus.PENDING : UserStatus.ACTIVE;

    try {
      const user = await this.usersService.createUser({
        email: registerDto.email,
        passwordHash,
        fullName: registerDto.fullName,
        phone: registerDto.phone,
        role,
        status,
        ...(role === Role.LANDLORD
          ? {
              landlordProfile: {
                create: {
                  publicDisplayName: registerDto.fullName,
                  publicPhone: registerDto.phone,
                  publicEmail: registerDto.email,
                  verificationStatus: VerificationStatus.PENDING
                }
              }
            }
          : role === Role.TENANT
          ? {
              tenantProfile: {
                create: {}
              }
            }
          : {})
      });

      return {
        user: this.usersService.getSafeUser(user)
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException("Email hoặc số điện thoại đã tồn tại");
      }

      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUserPassword(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException("Tài khoản hoặc mật khẩu không chính xác");
    }

    if (this.usersService.isAccountBlocked(user)) {
      throw new ForbiddenException("Tài khoản của bạn đã bị khóa hoặc không có quyền đăng nhập");
    }

    const accessToken = await this.generateAccessToken(this.usersService.getSafeUser(user));
    const loggedInUser = await this.usersService.updateLastLogin(user.id);

    return {
      accessToken,
      user: this.usersService.getSafeUser(loggedInUser)
    };
  }

  async generateAccessToken(user: Pick<AuthenticatedUser, "id" | "email" | "role">) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return this.jwtService.signAsync(payload);
  }

  async getCurrentUser(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user || this.usersService.isAccountBlocked(user)) {
      throw new UnauthorizedException("Unauthorized");
    }

    return this.usersService.getSafeUser(user);
  }

  private isUniqueConstraintError(error: unknown) {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
