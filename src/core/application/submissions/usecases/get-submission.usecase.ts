import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { SUBMISSION_REPOSITORY, SubmissionRepositoryPort } from "@core/domain/submissions/submission.repository.port";
import { USER_REPOSITORY, UserRepositoryPort } from "@core/domain/users/user.repository.port";
import { SubmissionDto } from "../dto/submission.dto";
import { SubmissionMapper } from "../mappers/submission.mapper";
import { UserRole } from "@core/domain/users/user.entity";

@Injectable()
export class GetSubmissionUseCase {
  constructor(
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: SubmissionRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: string, userId: string, userRole: UserRole): Promise<SubmissionDto> {
    const submission = await this.submissionRepository.findById(id);
    if (!submission) throw new NotFoundException("Submission no encontrado");

    if (submission.userId !== userId && userRole !== UserRole.PROFESSOR) {
      throw new ForbiddenException("No tienes permiso para ver este envío.");
    }

    const user = await this.userRepository.findById(submission.userId);
    const studentName = user ? user.fullName : 'Unknown';

    return SubmissionMapper.toDto(submission, studentName);
  }
}