import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../../modules/users/users.service";
import { AuthenticatedRequest, JwtPayload } from "../types/authenticated-user";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET
      });

      if (!payload.sub) {
        throw new UnauthorizedException("Unauthorized");
      }

      const user = await this.usersService.findById(payload.sub);

      if (!user || this.usersService.isAccountBlocked(user)) {
        throw new UnauthorizedException("Unauthorized");
      }

      request.user = this.usersService.getSafeUser(user);
      return true;
    } catch {
      throw new UnauthorizedException("Unauthorized");
    }
  }

  private extractTokenFromHeader(request: AuthenticatedRequest) {
    const authorization = request.headers.authorization;

    if (Array.isArray(authorization)) {
      return undefined;
    }

    const [type, token] = authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
