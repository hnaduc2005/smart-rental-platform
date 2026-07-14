import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

function trimString({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

export class ResetPasswordDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
