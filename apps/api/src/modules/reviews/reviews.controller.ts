import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Controller("reviews")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get("tenant/my")
  @Roles(Role.TENANT, Role.SEEKER)
  getForTenant(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.getForTenant(user.id);
  }

  @Post()
  @Roles(Role.TENANT)
  createReview(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto
  ) {
    return this.reviewsService.create(user.id, dto);
  }
}
