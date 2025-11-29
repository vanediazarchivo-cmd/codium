import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { SUBMISSION_REPOSITORY, SubmissionRepositoryPort } from "@core/domain/submissions/submission.repository.port";
import { CHALLENGE_REPOSITORY, ChallengeRepositoryPort } from "@core/domain/challenges/challenge.repository.port";
import { USER_REPOSITORY, UserRepositoryPort } from "@core/domain/users/user.repository.port";
import { TEST_CASE_REPOSITORY, TestCaseRepositoryPort } from "@core/domain/test-cases/test-case.repository.port";
import { Submission, SubmissionStatus, Language } from "@core/domain/submissions/submission.entity";
import { SubmitSolutionDto } from "../dto/submit-solution.dto";
import { SubmissionDto } from "../dto/submission.dto";
import { SubmissionMapper } from "../mappers/submission.mapper";

@Injectable()
export class SubmitSolutionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: SubmissionRepositoryPort,
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: ChallengeRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepository: TestCaseRepositoryPort,
    @InjectQueue('submissions')
    private readonly submissionQueue: Queue,
  ) {}

  private normalizeLanguage(lang: Language | string): Language {
    if (typeof lang === 'string') {
      const normalized = lang.toUpperCase().replace(/[.+]/g, '');
      const mapping: Record<string, Language> = {
        'PYTHON': Language.PYTHON,
        'JAVA': Language.JAVA,
        'NODEJS': Language.NODEJS,
        'NODJS': Language.NODEJS,
        'CPP': Language.CPP,
        'C': Language.CPP,
      };
      const mapped = mapping[normalized];
      if (!mapped) {
        throw new BadRequestException(
          `Lenguaje no soportado: ${lang}. Usa: Python, Java, Node.js, C++`,
        );
      }
      return mapped;
    }
    return lang as Language;
  }

  async execute(dto: SubmitSolutionDto, userId: string): Promise<SubmissionDto> {
    const challenge = await this.challengeRepository.findById(dto.challengeId);
    if (!challenge) throw new NotFoundException("Reto no encontrado");

    const user = await this.userRepository.findById(userId);
    const studentName = user ? user.fullName : 'Unknown';

    const normalizedLanguage = this.normalizeLanguage(dto.language);

    // Obtener test cases para enqueuing
    const testCases = await this.testCaseRepository.findByChallengeId(dto.challengeId);

    const submission = new Submission({
      id: uuidv4(),
      userId: userId,
      challengeId: dto.challengeId,
      groupId: dto.groupId,
      code: dto.code,
      language: normalizedLanguage,
      status: SubmissionStatus.QUEUED,
      score: 0,
      timeMsTotal: 0,
      memoryUsedMb: 0,
      results: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.submissionRepository.create(submission);

    // Encolar para procesamiento asíncrono
    // Encolar con nombre de trabajo 'process-submission' para compatibilidad con workers externos
    await this.submissionQueue.add(
      'process-submission',
      {
        submissionId: saved.id,
        userId,
        challengeId: saved.challengeId,
        code: saved.code,
        language: saved.language,
        testCases: testCases.map(tc => ({
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
      },
      {
        attempts: 3, // Reintentar 3 veces si falla
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      },
    );

    return SubmissionMapper.toDto(saved, studentName);
  }
}