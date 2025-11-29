import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { CHALLENGE_REPOSITORY, ChallengeRepositoryPort } from "@core/domain/challenges/challenge.repository.port";
import { TEST_CASE_REPOSITORY, TestCaseRepositoryPort } from "@core/domain/test-cases/test-case.repository.port";
import { TestCase } from "@core/domain/test-cases/test-case.entity";
import { UserRole } from "@core/domain/users/user.entity";
import { AddTestCaseDto } from "../dto/add-test-case.dto";

@Injectable()
export class AddTestCaseUseCase {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: ChallengeRepositoryPort,
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepository: TestCaseRepositoryPort,
  ) {}

  async execute(challengeId: string, dto: AddTestCaseDto, userId: string, userRole: UserRole): Promise<TestCase> {
    const challenge = await this.challengeRepository.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException("Reto no encontrado");
    }

    if (userRole !== UserRole.PROFESSOR && challenge.createdById !== userId) {
      throw new ForbiddenException("No tienes permiso para agregar casos de prueba a este reto");
    }

    const existingCases = await this.testCaseRepository.findByChallengeId(challengeId);
    const nextOrder = existingCases.length + 1;

    const testCase = new TestCase({
      id: uuidv4(),
      challengeId,
      input: dto.input,
      expectedOutput: dto.expectedOutput,
      isHidden: dto.isHidden,
      points: dto.points,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await this.testCaseRepository.create(testCase);
  }
}