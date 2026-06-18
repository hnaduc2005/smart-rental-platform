import { Controller, Get, UseGuards } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser } from "../../common/types/authenticated-user";

@Controller("tenants")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.tenantsService.getForLandlord(user.id);
  }

  @Get()
  @Roles(Role.LANDLORD, Role.ADMIN)
  findAll() {
    return this.tenantsService.findAll();
  }
}
