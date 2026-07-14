import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

function normalizeEmail({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

export class ForgotPasswordDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;
}
