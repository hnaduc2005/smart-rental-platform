import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { VerifiedLandlordGuard } from "../../common/guards/verified-landlord.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

@Controller("rooms")
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findPublic();
  }

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  findMyRooms(@CurrentUser() user: AuthenticatedUser) {
    return this.roomsService.findMyRooms(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.roomsService.findPublicById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedLandlordGuard)
  @Roles(Role.LANDLORD)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRoomDto) {
    return this.roomsService.createForLandlord(user.id, dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedLandlordGuard)
  @Roles(Role.LANDLORD)
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateRoomDto
  ) {
    return this.roomsService.updateForLandlord(id, user.id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard, VerifiedLandlordGuard)
  @Roles(Role.LANDLORD)
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.roomsService.deleteForLandlord(id, user.id);
  }
}
