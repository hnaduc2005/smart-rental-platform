import { IsEnum } from "class-validator";
import { AppointmentStatus } from "@smart-rental/database";

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status!: AppointmentStatus;
}
