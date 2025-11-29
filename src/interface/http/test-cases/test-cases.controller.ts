import { Controller, Post, Get, Param, Body, Delete, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AddTestCaseUseCase } from "@core/application/challenges/usecases/add-test-case.usecase";
import { TEST_CASE_REPOSITORY, TestCaseRepositoryPort } from '@core/domain/test-cases/test-case.repository.port';
import { AddTestCaseDto } from "@core/application/challenges/dto/add-test-case.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@core/domain/users/user.entity";

@ApiTags("test-cases")
@ApiBearerAuth()
@Controller("challenges/:challengeId/test-cases")
export class TestCasesController {
  constructor(
    private readonly addTestCaseUseCase: AddTestCaseUseCase,
    @Inject(TEST_CASE_REPOSITORY)
    private readonly testCaseRepository: TestCaseRepositoryPort,
  ) {}

  @Post()
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Add a test case to a challenge" })
  async addTestCase(
    @Param('challengeId') challengeId: string,
    @Body() dto: AddTestCaseDto,
    @CurrentUser() user: any,
  ) {
    return this.addTestCaseUseCase.execute(challengeId, dto, user.id, user.role);
  }

  @Get()
  @ApiOperation({ summary: "List test cases for a challenge (visible only to authorized users)" })
  async listTestCases(
    @Param('challengeId') challengeId: string,
    @CurrentUser() user: any,
  ) {
    // Students see only public cases; professors see all
    const cases = await this.testCaseRepository.findByChallengeId(challengeId);

    if (!cases) return [];

    if (user.role === 'PROFESSOR') {
      return cases;
    }

    // Filtrar casos ocultos para estudiantes
    return cases.filter((c) => !c.isHidden).map(c => ({
      id: c.id,
      input: c.input,
      expectedOutput: c.expectedOutput,
      order: c.order,
      points: c.points,
    }));
  }

  @Delete(":testCaseId")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Delete a test case" })
  async deleteTestCase(
    @Param('challengeId') challengeId: string,
    @Param('testCaseId') testCaseId: string,
    @CurrentUser() user: any,
  ) {
    // Solo profesores pueden eliminar
    await this.testCaseRepository.delete(testCaseId);
    return { message: 'Test case deleted' };
  }
}
