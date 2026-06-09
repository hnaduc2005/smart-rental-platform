import { Controller } from "@nestjs/common";
import { MeterReadingsService } from "./meter-readings.service";

@Controller("meter-readings")
export class MeterReadingsController {
  constructor(private readonly meterReadingsService: MeterReadingsService) {}
}
