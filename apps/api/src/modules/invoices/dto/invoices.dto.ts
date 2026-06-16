import { IsString, IsNotEmpty, IsDateString, IsNumber, IsEnum } from "class-validator";
import { InvoiceStatus } from "@smart-rental/database";

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  contractId!: string;

  @IsDateString()
  @IsNotEmpty()
  billingMonth!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @IsNumber()
  @IsNotEmpty()
  roomAmount!: number;

  @IsNumber()
  @IsNotEmpty()
  electricAmount!: number;

  @IsNumber()
  @IsNotEmpty()
  waterAmount!: number;

  @IsNumber()
  @IsNotEmpty()
  serviceAmount!: number;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;
}
