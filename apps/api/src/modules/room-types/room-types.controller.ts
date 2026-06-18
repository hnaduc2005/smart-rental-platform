import { Controller, Get } from "@nestjs/common";
import { RoomTypesService } from "./room-types.service";

@Controller("room-types")
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get()
  findAll() {
    return this.roomTypesService.findAll();
  }
}
