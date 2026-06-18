import { Controller, Get, Param, Patch, Post, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { UpdateRentalRequestStatusDto } from "./dto/update-rental-request-status.dto";
import { CreateRentalRequestDto } from "./dto/create-rental-request.dto";
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

  @Get("seeker/my")
  @Roles(Role.SEEKER, Role.TENANT)
  getForSeeker(@CurrentUser() user: AuthenticatedUser) {
    return this.rentalRequestsService.getForSeeker(user.id);
  }

  @Post()
  @Roles(Role.SEEKER, Role.TENANT)
  createRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRentalRequestDto
  ) {
    return this.rentalRequestsService.create(user.id, dto);
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
