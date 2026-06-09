import { Controller } from "@nestjs/common";
import { CoTenantsService } from "./co-tenants.service";

@Controller("co-tenants")
export class CoTenantsController {
  constructor(private readonly coTenantsService: CoTenantsService) {}
}
