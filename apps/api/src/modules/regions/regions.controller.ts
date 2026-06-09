import { Controller } from "@nestjs/common";
import { RegionsService } from "./regions.service";

@Controller("regions")
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}
}
