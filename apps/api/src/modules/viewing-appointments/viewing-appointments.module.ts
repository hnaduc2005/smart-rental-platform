import { Module } from "@nestjs/common";
import { ViewingAppointmentsController } from "./viewing-appointments.controller";
import { ViewingAppointmentsService } from "./viewing-appointments.service";

@Module({
  controllers: [ViewingAppointmentsController],
  providers: [ViewingAppointmentsService],
  exports: [ViewingAppointmentsService]
})
export class ViewingAppointmentsModule {}
