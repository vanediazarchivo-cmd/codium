import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsDateString, IsArray, IsUUID } from "class-validator";
import { EvaluationStatus } from "@core/domain/evaluations/evaluation.entity";

export class CreateEvaluationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "ID del grupo" })
  @IsNotEmpty()
  @IsUUID()
  groupId: string;

  @ApiProperty({ type: String, example: "2025-01-15T10:00:00Z" })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ type: String, example: "2025-01-20T23:59:59Z" })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ type: [String], example: ["uuid1", "uuid2"] })
  @IsOptional()
  @IsArray()
  @IsUUID("all", { each: true })
  challengeIds?: string[];
}

export class UpdateEvaluationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: String, example: "2025-01-15T10:00:00Z" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ type: String, example: "2025-01-20T23:59:59Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ enum: ["DRAFT", "PUBLISHED", "CLOSED"] })
  @IsOptional()
  @IsString()
  status?: EvaluationStatus;
}

export class AddChallengeToEvaluationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  challengeId: string;

  @ApiProperty()
  @IsNotEmpty()
  order: number;
}
