import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";
import { IssueType } from "@smart-rental/database";

export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsOptional()
  contractId?: string;

  @IsEnum(IssueType)
  @IsNotEmpty()
  type!: IssueType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
