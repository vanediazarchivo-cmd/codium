import { Evaluation } from "@core/domain/evaluations/evaluation.entity";
import { EvaluationDto } from "../dto/evaluation.dto";

export class EvaluationMapper {
  static toDto(entity: Evaluation): EvaluationDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      groupId: entity.groupId,
      status: entity.status,
      startDate: entity.startDate,
      endDate: entity.endDate,
      challengeIds: entity.challengeIds,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toDtoArray(entities: Evaluation[]): EvaluationDto[] {
    return entities.map(e => this.toDto(e));
  }
}
