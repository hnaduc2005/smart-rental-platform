import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { UpdateRentalRequestStatusDto } from "./dto/update-rental-request-status.dto";
import { RentalRequestsService } from "./rental-requests.service";

@Controller("rental-requests")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RentalRequestsController {
  constructor(private readonly rentalRequestsService: RentalRequestsService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.rentalRequestsService.getForLandlord(user.id);
  }

  @Patch(":id/status")
  @Roles(Role.LANDLORD)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateRentalRequestStatusDto
  ) {
    return this.rentalRequestsService.updateStatus(user.id, id, dto);
  }
}
