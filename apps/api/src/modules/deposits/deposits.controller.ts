import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { DepositsService } from "./deposits.service";
import { UpdateDepositStatusDto } from "./dto/update-deposit-status.dto";

@Controller("deposits")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.depositsService.getForLandlord(user.id);
  }

  @Patch(":id/status")
  @Roles(Role.LANDLORD)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateDepositStatusDto
  ) {
    return this.depositsService.updateStatus(user.id, id, dto);
  }
}
