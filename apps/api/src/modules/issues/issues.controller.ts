import { Controller, Get, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { IssuesService } from "./issues.service";
import { UpdateIssueStatusDto } from "./dto/update-issue-status.dto";

@Controller("issue-reports")
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get("my")
  @Roles(Role.LANDLORD)
  getForLandlord(@CurrentUser() user: AuthenticatedUser) {
    return this.issuesService.getForLandlord(user.id);
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
