import { Controller } from "@nestjs/common";
import { RentalRequestsService } from "./rental-requests.service";

@Controller("rental-requests")
export class RentalRequestsController {
  constructor(private readonly rentalRequestsService: RentalRequestsService) {}
}
