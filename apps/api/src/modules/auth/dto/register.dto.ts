import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  NotEquals
} from "class-validator";
import { Role } from "@smart-rental/database";

function trimString({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim() : value;
}

function optionalTrimString({ value }: { value: unknown }) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeEmail({ value }: { value: unknown }) {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

export class RegisterDto {
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName!: string;

  @Transform(optionalTrimString)
  @IsOptional()
  @IsString()
  @Matches(/^\+?\d{9,15}$/, {
    message: "phone must contain 9 to 15 digits and may start with +"
  })
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  @NotEquals(Role.ADMIN, {
    message: "ADMIN registration is not allowed from the public API"
  })
  role?: Role;
}
