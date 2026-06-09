import { Controller } from "@nestjs/common";
import { DepositsService } from "./deposits.service";

@Controller("deposits")
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}
}
