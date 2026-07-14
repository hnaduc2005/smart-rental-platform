import { Type, Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min
} from "class-validator";
import { Role, RoomStatus, UserStatus, VerificationStatus } from "@smart-rental/database";

function optionalBoolean({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return value;
}
function optionalTrim({ value }: { value: unknown }) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class AdminUsersQueryDto extends PaginationQueryDto {
  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status!: UserStatus;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}

export class AdminLandlordsQueryDto extends PaginationQueryDto {
  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;
}

export class RejectLandlordDto {
  @Transform(optionalTrim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class AdminRoomsQueryDto extends PaginationQueryDto {
  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  regionId?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  landlordId?: string;
}

export class UpdateRoomStatusDto {
  @IsEnum(RoomStatus)
  status!: RoomStatus;
}

export class CategoryQueryDto extends PaginationQueryDto {
  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @Transform(optionalBoolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpsertCategoryDto {
  @Transform(optionalTrim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpsertRegionDto {
  @Transform(optionalTrim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @Transform(optionalTrim)
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class SetActiveDto {
  @Transform(optionalBoolean)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
