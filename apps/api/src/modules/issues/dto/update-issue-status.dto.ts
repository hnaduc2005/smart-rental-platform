import { IsEnum } from "class-validator";
import { IssueStatus } from "@smart-rental/database";

export class UpdateIssueStatusDto {
  @IsEnum(IssueStatus)
  status!: IssueStatus;
}
