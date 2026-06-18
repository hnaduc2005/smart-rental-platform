import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { LandlordsService } from "./landlords.service";

@Controller("landlords")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.landlordsService.getMyProfile(user.id);
  }

  @Put("my")
  @Roles(Role.LANDLORD)
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: { bankName?: string; bankAccountNumber?: string; bankAccountName?: string }
  ) {
    return this.landlordsService.updateMyProfile(user.id, data);
  }
}
