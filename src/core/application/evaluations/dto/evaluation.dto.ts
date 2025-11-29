import { ApiProperty } from "@nestjs/swagger";
import { EvaluationStatus } from "@core/domain/evaluations/evaluation.entity";

export class EvaluationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty({ enum: EvaluationStatus })
  status: EvaluationStatus;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  challengeIds: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
