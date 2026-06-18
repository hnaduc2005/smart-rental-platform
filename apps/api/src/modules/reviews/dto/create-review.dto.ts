import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from "class-validator";

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsOptional()
  contractId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
