import { Controller, Get, Post, Body, Patch, Param, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ContractsService } from "./contracts.service";
import { CreateContractDto, UpdateContractStatusDto } from "./dto/contracts.dto";

@Controller("contracts")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.contractsService.getForLandlord(user.id);
  }

  @Post()
  @Roles(Role.LANDLORD)
  createContract(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContractDto
  ) {
    return this.contractsService.createContract(user.id, dto);
  }

  @Patch(":id/status")
  @Roles(Role.LANDLORD)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateContractStatusDto
  ) {
    return this.contractsService.updateStatus(user.id, id, dto);
  }
}
