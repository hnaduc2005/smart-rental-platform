import { Controller, Get, Param } from "@nestjs/common";
import { RegionsService } from "./regions.service";

@Controller("regions")
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get("provinces")
  getProvinces() {
    return this.regionsService.findAllProvinces();
  }

  @Get("provinces/:provinceId/districts")
  getDistrictsByProvince(@Param("provinceId") provinceId: string) {
    return this.regionsService.findDistrictsByProvince(provinceId);
  }
}
