import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller("payments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("tenant/my")
  @Roles(Role.TENANT, Role.SEEKER)
  getForTenant(@CurrentUser() user: AuthenticatedUser) {
    return this.paymentsService.getForTenant(user.id);
  }

  @Post()
  @Roles(Role.TENANT)
  createPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentDto
  ) {
    return this.paymentsService.create(user.id, dto);
  }
}
