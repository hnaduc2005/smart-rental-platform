import { IsString, IsNotEmpty, IsDateString, IsOptional, IsNumber, IsEnum } from "class-validator";
import { ContractStatus } from "@smart-rental/database";

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsOptional()
  rentalRequestId?: string;

  @IsString()
  @IsNotEmpty()
  tenantProfileId!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsNotEmpty()
  rentAmount!: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsNumber()
  @IsOptional()
  paymentDueDay?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateContractStatusDto {
  @IsEnum(ContractStatus)
  status!: ContractStatus;
}
