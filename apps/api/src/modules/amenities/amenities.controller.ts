import { Controller, Get } from "@nestjs/common";
import { AmenitiesService } from "./amenities.service";

@Controller("amenities")
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Get()
  findAll() {
    return this.amenitiesService.findAll();
  }
}
