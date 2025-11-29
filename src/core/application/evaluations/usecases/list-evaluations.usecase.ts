import { Inject, Injectable } from "@nestjs/common";
import { EVALUATION_REPOSITORY, EvaluationRepositoryPort } from "@core/domain/evaluations/evaluation.repository.port";
import { EvaluationDto } from "../dto/evaluation.dto";
import { EvaluationMapper } from "../mappers/evaluation.mapper";

@Injectable()
export class ListEvaluationsUseCase {
  constructor(
    @Inject(EVALUATION_REPOSITORY)
    private readonly evaluationRepository: EvaluationRepositoryPort,
  ) {}

  async execute(groupId?: string): Promise<EvaluationDto[]> {
    let evaluations;

    if (groupId) {
      evaluations = await this.evaluationRepository.findByGroupId(groupId);
    } else {
      evaluations = await this.evaluationRepository.findAll();
    }

    return EvaluationMapper.toDtoArray(evaluations);
  }
}
