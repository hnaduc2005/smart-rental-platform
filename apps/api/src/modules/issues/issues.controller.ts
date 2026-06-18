import { Controller, Get, Patch, Post, Param, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { IssuesService } from "./issues.service";
import { UpdateIssueStatusDto } from "./dto/update-issue-status.dto";
import { CreateIssueDto } from "./dto/create-issue.dto";

@Controller("issue-reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.issuesService.getForLandlord(user.id);
  }

  @Get("tenant/my")
  @Roles(Role.TENANT, Role.SEEKER)
  getForTenant(@CurrentUser() user: AuthenticatedUser) {
    return this.issuesService.getForTenant(user.id);
  }

  @Post()
  @Roles(Role.TENANT)
  createIssue(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIssueDto
  ) {
    return this.issuesService.create(user.id, dto);
  }

  @Patch(":id/status")
  @Roles(Role.LANDLORD)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateIssueStatusDto
  ) {
    return this.issuesService.updateStatus(user.id, id, dto);
  }
}
