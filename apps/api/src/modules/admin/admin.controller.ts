import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import {
  AdminLandlordsQueryDto,
  AdminRoomsQueryDto,
  AdminUsersQueryDto,
  CategoryQueryDto,
  RejectLandlordDto,
  SetActiveDto,
  UpdateRoomStatusDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
  UpsertCategoryDto,
  UpsertRegionDto
} from "./dto/admin.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("health")
  health() {
    return this.adminService.getHealth();
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.getCurrentAdmin(user);
  }

  @Get("dashboard-summary")
  getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }

  @Get("users")
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get("users/:id")
  getUser(@Param("id") id: string) {
    return this.adminService.getUser(id);
  }

  @Patch("users/:id/status")
  updateUserStatus(
    @Param("id") id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateUserStatus(id, dto.status, user);
  }

  @Patch("users/:id/role")
  updateUserRole(
    @Param("id") id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateUserRole(id, dto.role, user);
  }

  @Get("landlords")
  listLandlords(@Query() query: AdminLandlordsQueryDto) {
    return this.adminService.listLandlords(query);
  }

  @Get("landlords/pending")
  listPendingLandlords(@Query() query: AdminLandlordsQueryDto) {
    return this.adminService.listPendingLandlords(query);
  }

  @Get("landlords/:id")
  getLandlord(@Param("id") id: string) {
    return this.adminService.getLandlord(id);
  }

  @Patch("landlords/:id/approve")
  approveLandlord(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.approveLandlord(id, user);
  }

  @Patch("landlords/:id/reject")
  rejectLandlord(
    @Param("id") id: string,
    @Body() dto: RejectLandlordDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.rejectLandlord(id, dto.reason, user);
  }

  @Get("rooms")
  listRooms(@Query() query: AdminRoomsQueryDto) {
    return this.adminService.listRooms(query);
  }

  @Get("rooms/:id")
  getRoom(@Param("id") id: string) {
    return this.adminService.getRoom(id);
  }

  @Patch("rooms/:id/status")
  updateRoomStatus(
    @Param("id") id: string,
    @Body() dto: UpdateRoomStatusDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateRoomStatus(id, dto.status, user);
  }

  @Get("room-types")
  listRoomTypes(@Query() query: CategoryQueryDto) {
    return this.adminService.listRoomTypes(query);
  }

  @Post("room-types")
  createRoomType(@Body() dto: UpsertCategoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.createRoomType(dto, user);
  }

  @Patch("room-types/:id")
  updateRoomType(
    @Param("id") id: string,
    @Body() dto: UpsertCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateRoomType(id, dto, user);
  }

  @Patch("room-types/:id/disable")
  setRoomTypeActive(
    @Param("id") id: string,
    @Body() dto: SetActiveDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.setRoomTypeActive(id, dto, user);
  }

  @Get("amenities")
  listAmenities(@Query() query: CategoryQueryDto) {
    return this.adminService.listAmenities(query);
  }

  @Post("amenities")
  createAmenity(@Body() dto: UpsertCategoryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.createAmenity(dto, user);
  }

  @Patch("amenities/:id")
  updateAmenity(
    @Param("id") id: string,
    @Body() dto: UpsertCategoryDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateAmenity(id, dto, user);
  }

  @Patch("amenities/:id/disable")
  setAmenityActive(
    @Param("id") id: string,
    @Body() dto: SetActiveDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.setAmenityActive(id, dto, user);
  }

  @Get("regions")
  listRegions(@Query() query: CategoryQueryDto) {
    return this.adminService.listRegions(query);
  }

  @Post("regions")
  createRegion(@Body() dto: UpsertRegionDto, @CurrentUser() user: AuthenticatedUser) {
    return this.adminService.createRegion(dto, user);
  }

  @Patch("regions/:id")
  updateRegion(
    @Param("id") id: string,
    @Body() dto: UpsertRegionDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.updateRegion(id, dto, user);
  }

  @Patch("regions/:id/disable")
  setRegionActive(
    @Param("id") id: string,
    @Body() dto: SetActiveDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.adminService.setRegionActive(id, dto, user);
  }

  @Get("reports/overview")
  getReportsOverview() {
    return this.adminService.getReportsOverview();
  }
}
