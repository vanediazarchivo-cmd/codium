import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { EVALUATION_REPOSITORY, EvaluationRepositoryPort } from "@core/domain/evaluations/evaluation.repository.port";
import { Evaluation, EvaluationStatus } from "@core/domain/evaluations/evaluation.entity";
import { CreateEvaluationDto } from "../dto/create-evaluation.dto";
import { EvaluationDto } from "../dto/evaluation.dto";
import { EvaluationMapper } from "../mappers/evaluation.mapper";

@Injectable()
export class CreateEvaluationUseCase {
  constructor(
    @Inject(EVALUATION_REPOSITORY)
    private readonly evaluationRepository: EvaluationRepositoryPort,
  ) {}

  async execute(dto: CreateEvaluationDto): Promise<EvaluationDto> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException("Start date must be before end date");
    }

    const evaluation = new Evaluation({
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      groupId: dto.groupId,
      status: EvaluationStatus.DRAFT,
      startDate,
      endDate,
      challengeIds: dto.challengeIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.evaluationRepository.create(evaluation, dto.challengeIds || []);
    return EvaluationMapper.toDto(created);
  }
}
