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
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import * as crypto from "crypto";
import { MailerService } from "@nestjs-modules/mailer";

const PASSWORD_RESET_SUCCESS_MESSAGE =
  "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn khôi phục mật khẩu.";

function getAppUrl() {
  return (process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function hasMailerCredentials() {
  return Boolean(process.env.MAIL_USER && process.env.MAIL_PASS);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService
  ) {}

  async register(registerDto: RegisterDto) {
    const role = registerDto.role ?? Role.SEEKER;
    const email = registerDto.email.toLowerCase();

    if (role === Role.ADMIN) {
      throw new BadRequestException("Không được phép đăng ký tài khoản ADMIN từ giao diện công khai");
    }

    const existingUser = await this.usersService.findByEmail(email);

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
        email,
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
                  publicEmail: email,
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await this.usersService.updateResetToken(user.id, resetToken, expiresAt);

    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${resetToken}`;

    if (!hasMailerCredentials()) {
      console.warn("Password reset email skipped because MAIL_USER or MAIL_PASS is not configured.");
      return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
    }

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: "Smart Rental - Khôi phục mật khẩu",
        html: `
          <h3>Xin chào ${user.fullName || "bạn"},</h3>
          <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản trên Smart Rental.</p>
          <p>Vui lòng click vào đường link bên dưới để đặt lại mật khẩu mới:</p>
          <p><a href="${resetUrl}" style="padding: 10px 15px; background-color: #0056b3; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a></p>
          <p>Hoặc copy đường dẫn này vào trình duyệt: <br/> ${resetUrl}</p>
          <p>Đường link này sẽ hết hạn sau 30 phút.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        `
      });
    } catch (e) {
      console.error("Gửi email thất bại:", e);
    }

    return { message: PASSWORD_RESET_SUCCESS_MESSAGE };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);

    if (!user) {
      throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn");
    }

    await this.usersService.updatePassword(user.id, resetPasswordDto.newPassword);

    return { message: "Khôi phục mật khẩu thành công" };
  }
}
