import { IsEnum, IsOptional, IsString } from "class-validator";
import { DepositStatus } from "@smart-rental/database";

export class UpdateDepositStatusDto {
  @IsEnum(DepositStatus)
  status!: DepositStatus;

  @IsString()
  @IsOptional()
  rejectedReason?: string;
}
