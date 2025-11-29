import { Inject, Injectable } from "@nestjs/common";
import { EVALUATION_REPOSITORY, EvaluationRepositoryPort } from "@core/domain/evaluations/evaluation.repository.port";
import { UserRole } from "@core/domain/users/user.entity";
import { Evaluation } from "@core/domain/evaluations/evaluation.entity";
import { EvaluationDto } from "../dto/evaluation.dto";
import { EvaluationMapper } from "../mappers/evaluation.mapper";

@Injectable()
export class GetActiveEvaluationsUseCase {
  constructor(
    @Inject(EVALUATION_REPOSITORY)
    private readonly evaluationRepository: EvaluationRepositoryPort,
  ) {}

  async execute(groupId?: string): Promise<EvaluationDto[]> {
    const now = new Date();

    let evaluations: Evaluation[] = [];

    if (groupId) {
      evaluations = await this.evaluationRepository.findByGroupId(groupId);
    } else {
      evaluations = await this.evaluationRepository.findAll();
    }

    // Filter only PUBLISHED evaluations that are currently active (startDate <= now <= endDate)
    const activeEvaluations = evaluations.filter(
      (ev) =>
        ev.status === "PUBLISHED" &&
        new Date(ev.startDate) <= now &&
        now <= new Date(ev.endDate),
    );

    return activeEvaluations.map((ev) => EvaluationMapper.toDto(ev));
  }
}
