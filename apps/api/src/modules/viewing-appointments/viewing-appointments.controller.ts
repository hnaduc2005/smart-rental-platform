import { Controller } from "@nestjs/common";
import { ViewingAppointmentsService } from "./viewing-appointments.service";

@Controller("viewing-appointments")
export class ViewingAppointmentsController {
  constructor(
    private readonly viewingAppointmentsService: ViewingAppointmentsService
  ) {}
}
