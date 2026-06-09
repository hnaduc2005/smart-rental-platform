import { Module } from "@nestjs/common";
import { RentalRequestsController } from "./rental-requests.controller";
import { RentalRequestsService } from "./rental-requests.service";

@Module({
  controllers: [RentalRequestsController],
  providers: [RentalRequestsService],
  exports: [RentalRequestsService]
})
export class RentalRequestsModule {}
