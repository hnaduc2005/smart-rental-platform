import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsInt, IsEnum, IsArray } from 'class-validator';
import { RoomStatus } from '@smart-rental/database';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsOptional()
  roomTypeId?: string;

  @IsString()
  @IsOptional()
  regionId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  area?: number;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  rules?: string;

  @IsInt()
  @Min(1)
  maxOccupants!: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsString()
  @IsOptional()
  publicContactName?: string;

  @IsString()
  @IsOptional()
  publicContactPhone?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenityIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
