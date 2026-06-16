import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { Role } from "@smart-rental/database";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PropertiesService } from "./properties.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";

@Controller("properties")
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll() {
    return this.propertiesService.findMany({
      where: { status: "ACTIVE" }
    });
  }

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  findMyProperties(@CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.findMyProperties(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.propertiesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.createForLandlord(user.id, dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePropertyDto
  ) {
    return this.propertiesService.updateForLandlord(id, user.id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LANDLORD)
  remove(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.propertiesService.deleteForLandlord(id, user.id);
  }
}
