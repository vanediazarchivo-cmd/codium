import { Inject, Injectable, ForbiddenException } from "@nestjs/common";
import { CHALLENGE_REPOSITORY, ChallengeRepositoryPort } from "@core/domain/challenges/challenge.repository.port";
import { CreateChallengeDto } from "../dto/create-challenge.dto";
import { ChallengeDto } from "../dto/challenge.dto";
import { ChallengeMapper } from "../mappers/challenge.mapper";
import { Challenge, ChallengeStatus } from "@core/domain/challenges/challenge.entity";
import { UserRole } from "@core/domain/users/user.entity";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateChallengeUseCase {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: ChallengeRepositoryPort,
  ) {}

  async execute(dto: CreateChallengeDto, userId: string, userRole: UserRole): Promise<ChallengeDto> {
    if (userRole !== UserRole.PROFESSOR) {
      throw new ForbiddenException("Solo profesores pueden crear retos");
    }

    const newChallenge = new Challenge({
      id: uuidv4(),
      ...dto,
      status: ChallengeStatus.DRAFT,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdChallenge = await this.challengeRepository.create(newChallenge);

    return ChallengeMapper.toDto(createdChallenge);
  }
}