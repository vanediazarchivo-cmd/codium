import { Controller, Get, Post, Patch, Param, Query, Body, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { CreateEvaluationUseCase } from "@core/application/evaluations/usecases/create-evaluation.usecase";
import { UpdateEvaluationUseCase } from "@core/application/evaluations/usecases/update-evaluation.usecase";
import { ListEvaluationsUseCase } from "@core/application/evaluations/usecases/list-evaluations.usecase";
import { GetEvaluationUseCase } from "@core/application/evaluations/usecases/get-evaluation.usecase";
import { DeleteEvaluationUseCase } from "@core/application/evaluations/usecases/delete-evaluation.usecase";
import { AddChallengeToEvaluationUseCase } from "@core/application/evaluations/usecases/add-challenge-to-evaluation.usecase";
import { RemoveChallengeFromEvaluationUseCase } from "@core/application/evaluations/usecases/remove-challenge-from-evaluation.usecase";
import { GetActiveEvaluationsUseCase } from "@core/application/evaluations/usecases/get-active-evaluations.usecase";
import { CreateEvaluationDto, UpdateEvaluationDto, AddChallengeToEvaluationDto } from "@core/application/evaluations/dto/create-evaluation.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@core/domain/users/user.entity";

@ApiTags("evaluations")
@ApiBearerAuth()
@Controller("evaluations")
export class EvaluationsController {
  constructor(
    private readonly createEvaluationUseCase: CreateEvaluationUseCase,
    private readonly updateEvaluationUseCase: UpdateEvaluationUseCase,
    private readonly listEvaluationsUseCase: ListEvaluationsUseCase,
    private readonly getEvaluationUseCase: GetEvaluationUseCase,
    private readonly deleteEvaluationUseCase: DeleteEvaluationUseCase,
    private readonly addChallengeToEvaluationUseCase: AddChallengeToEvaluationUseCase,
    private readonly removeChallengeFromEvaluationUseCase: RemoveChallengeFromEvaluationUseCase,
    private readonly getActiveEvaluationsUseCase: GetActiveEvaluationsUseCase,
  ) {}

  @Post()
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Create a new evaluation" })
  @ApiResponse({ status: 201, description: "Evaluation created" })
  async create(@Body() dto: CreateEvaluationDto, @CurrentUser() user: any) {
    return this.createEvaluationUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all evaluations (filtered by group)" })
  @ApiResponse({ status: 200, description: "List of evaluations" })
  async list(@Query("groupId") groupId?: string) {
    return this.listEvaluationsUseCase.execute(groupId);
  }

  @Get("active")
  @ApiOperation({ summary: "Get currently active evaluations" })
  @ApiResponse({ status: 200, description: "List of active evaluations" })
  async getActive(@Query("groupId") groupId?: string) {
    return this.getActiveEvaluationsUseCase.execute(groupId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get evaluation by ID" })
  @ApiResponse({ status: 200, description: "Evaluation details" })
  async get(@Param("id") id: string) {
    return this.getEvaluationUseCase.execute(id);
  }

  @Patch(":id")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Update evaluation" })
  @ApiResponse({ status: 200, description: "Evaluation updated" })
  async update(@Param("id") id: string, @Body() dto: UpdateEvaluationDto) {
    return this.updateEvaluationUseCase.execute(id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Delete evaluation" })
  @ApiResponse({ status: 200, description: "Evaluation deleted" })
  async delete(@Param("id") id: string) {
    return this.deleteEvaluationUseCase.execute(id);
  }

  @Post(":id/challenges")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Add challenge to evaluation" })
  @ApiResponse({ status: 200, description: "Challenge added" })
  async addChallenge(@Param("id") evaluationId: string, @Body() dto: AddChallengeToEvaluationDto) {
    return this.addChallengeToEvaluationUseCase.execute(evaluationId, dto);
  }

  @Delete(":id/challenges/:challengeId")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Remove challenge from evaluation" })
  @ApiResponse({ status: 200, description: "Challenge removed" })
  async removeChallenge(@Param("id") evaluationId: string, @Param("challengeId") challengeId: string) {
    return this.removeChallengeFromEvaluationUseCase.execute(evaluationId, challengeId);
  }
}
