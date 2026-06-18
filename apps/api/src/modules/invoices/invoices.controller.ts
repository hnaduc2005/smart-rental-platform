import { Controller, Get, Post, Body, Patch, Param, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from "./dto/invoices.dto";

@Controller("invoices")
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.invoicesService.getForLandlord(user.id);
  }

  @Get("tenant/my")
  @Roles(Role.TENANT, Role.SEEKER)
  getForTenant(@CurrentUser() user: AuthenticatedUser) {
    return this.invoicesService.getForTenant(user.id);
  }

  @Post()
  @Roles(Role.LANDLORD)
  createInvoice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInvoiceDto
  ) {
    return this.invoicesService.createInvoice(user.id, dto);
  }

  @Patch(":id/status")
  @Roles(Role.LANDLORD)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateInvoiceStatusDto
  ) {
    return this.invoicesService.updateStatus(user.id, id, dto);
  }
}
