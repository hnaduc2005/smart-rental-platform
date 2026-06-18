import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateRentalRequestDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsOptional()
  message?: string;
}
