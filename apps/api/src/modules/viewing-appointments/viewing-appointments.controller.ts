import { Controller, Get, Param, Patch, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";
import { ViewingAppointmentsService } from "./viewing-appointments.service";

@Controller("viewing-appointments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ViewingAppointmentsController {
  constructor(
    private readonly viewingAppointmentsService: ViewingAppointmentsService
  ) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.viewingAppointmentsService.getForLandlord(user.id);
  }

  @Patch(":id/status")
  @Roles(Role.LANDLORD)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateAppointmentStatusDto
  ) {
    return this.viewingAppointmentsService.updateStatus(user.id, id, dto);
  }
}
