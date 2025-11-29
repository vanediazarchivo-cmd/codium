import { Module } from "@nestjs/common";
import { EvaluationsController } from "./evaluations.controller";
import { CreateEvaluationUseCase } from "@core/application/evaluations/usecases/create-evaluation.usecase";
import { UpdateEvaluationUseCase } from "@core/application/evaluations/usecases/update-evaluation.usecase";
import { ListEvaluationsUseCase } from "@core/application/evaluations/usecases/list-evaluations.usecase";
import { GetEvaluationUseCase } from "@core/application/evaluations/usecases/get-evaluation.usecase";
import { DeleteEvaluationUseCase } from "@core/application/evaluations/usecases/delete-evaluation.usecase";
import { AddChallengeToEvaluationUseCase } from "@core/application/evaluations/usecases/add-challenge-to-evaluation.usecase";
import { RemoveChallengeFromEvaluationUseCase } from "@core/application/evaluations/usecases/remove-challenge-from-evaluation.usecase";
import { GetActiveEvaluationsUseCase } from "@core/application/evaluations/usecases/get-active-evaluations.usecase";
import { EVALUATION_REPOSITORY } from "@core/domain/evaluations/evaluation.repository.port";
import { EvaluationPrismaRepository } from "@infrastructure/database/prisma/evaluation-prisma.repository";
import { PrismaService } from "@infrastructure/database/prisma.service";

@Module({
  controllers: [EvaluationsController],
  providers: [
    CreateEvaluationUseCase,
    UpdateEvaluationUseCase,
    ListEvaluationsUseCase,
    GetEvaluationUseCase,
    DeleteEvaluationUseCase,
    AddChallengeToEvaluationUseCase,
    RemoveChallengeFromEvaluationUseCase,
    GetActiveEvaluationsUseCase,
    PrismaService,
    {
      provide: EVALUATION_REPOSITORY,
      useClass: EvaluationPrismaRepository,
    },
  ],
  exports: [EVALUATION_REPOSITORY],
})
export class EvaluationsModule {}
