import { Controller } from "@nestjs/common";
import { ServicePackagesService } from "./service-packages.service";

@Controller("service-packages")
export class ServicePackagesController {
  constructor(private readonly servicePackagesService: ServicePackagesService) {}
}
