import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { CHALLENGE_REPOSITORY, ChallengeRepositoryPort } from "@core/domain/challenges/challenge.repository.port";
import { TEST_CASE_REPOSITORY, TestCaseRepositoryPort } from "@core/domain/test-cases/test-case.repository.port";
import { UserRole } from "@core/domain/users/user.entity";

@Injectable()
export class DeleteChallengeUseCase {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: ChallengeRepositoryPort,
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepository: TestCaseRepositoryPort,
  ) {}

  async execute(id: string, userId: string, userRole: UserRole): Promise<void> {
    const challenge = await this.challengeRepository.findById(id);

    if (!challenge) {
      throw new NotFoundException("Reto no encontrado");
    }

    if (userRole !== UserRole.PROFESSOR && challenge.createdById !== userId) {
      throw new ForbiddenException("No tienes permiso para eliminar este reto");
    }

    await this.challengeRepository.delete(id);
  }
}