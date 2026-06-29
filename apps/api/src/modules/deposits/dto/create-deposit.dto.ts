import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateDepositDto {
  @IsOptional()
  @IsString()
  rentalRequestId?: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  proofImageUrl!: string;
}
