import { IsString, IsNotEmpty, IsOptional, IsDateString } from "class-validator";

export class CreateCoTenantDto {
  @IsString()
  @IsNotEmpty()
  contractId!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  identityNumber?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  relationship?: string;
}
