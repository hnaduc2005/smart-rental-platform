import { IsEnum } from "class-validator";
import { RentalRequestStatus } from "@smart-rental/database";

export class UpdateRentalRequestStatusDto {
  @IsEnum(RentalRequestStatus)
  status!: RentalRequestStatus;
}
