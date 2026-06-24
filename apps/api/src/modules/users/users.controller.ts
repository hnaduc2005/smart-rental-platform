import { Controller, Put, Body, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put("profile")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateDto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(user.id, updateDto);
  }

  @Put("password")
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}
