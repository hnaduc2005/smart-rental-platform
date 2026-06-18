import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @IsString()
  @IsOptional()
  proofImageUrl?: string;
}
