import { Controller, Post, Body, Delete, Param, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { CoTenantsService } from "./co-tenants.service";
import { CreateCoTenantDto } from "./dto/create-co-tenant.dto";

@Controller("co-tenants")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoTenantsController {
  constructor(private readonly coTenantsService: CoTenantsService) {}

  @Post()
  @Roles(Role.LANDLORD)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCoTenantDto
  ) {
    return this.coTenantsService.create(user.id, dto);
  }

  @Delete(":id")
  @Roles(Role.LANDLORD)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string
  ) {
    return this.coTenantsService.remove(user.id, id);
  }
}
