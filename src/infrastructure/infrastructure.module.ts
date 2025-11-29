import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { RunnerService } from './runners/runner.service';
import { SubmissionProcessor } from './queue/submission.processor';
import { PrismaService } from './database/prisma.service';
import { SUBMISSION_REPOSITORY } from '@core/domain/submissions/submission.repository.port';
import { TEST_CASE_REPOSITORY } from '@core/domain/test-cases/test-case.repository.port';
import { SubmissionPrismaRepository } from './database/prisma/submission-prisma.repository';
import { TestCasePrismaRepository } from './database/prisma/test-case-prisma.repository';

@Module({
  imports: [QueueModule],
  providers: [
    RunnerService,
    PrismaService,
    {
      provide: SUBMISSION_REPOSITORY,
      useClass: SubmissionPrismaRepository,
    },
    {
      provide: TEST_CASE_REPOSITORY,
      useClass: TestCasePrismaRepository,
    },
  ],
  exports: [QueueModule, RunnerService, PrismaService, SUBMISSION_REPOSITORY, TEST_CASE_REPOSITORY],
})
export class InfrastructureModule {}
