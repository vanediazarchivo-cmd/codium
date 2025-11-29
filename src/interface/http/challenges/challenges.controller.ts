import { Controller, Get, Post, Patch, Param, Query, Body, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CreateChallengeUseCase } from "@core/application/challenges/usecases/create-challenge.usecase";
import { UpdateChallengeUseCase } from "@core/application/challenges/usecases/update-challenge.usecase";
import { ListChallengesUseCase } from "@core/application/challenges/usecases/list-challenges.usecase";
import { GetChallengeUseCase } from "@core/application/challenges/usecases/get-challenge.usecase";
import { DeleteChallengeUseCase } from "@core/application/challenges/usecases/delete-challenge.usecase";
import { CreateChallengeDto } from "@core/application/challenges/dto/create-challenge.dto";
import { UpdateChallengeDto } from "@core/application/challenges/dto/update-challenge.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@core/domain/users/user.entity";

@ApiTags("challenges")
@ApiBearerAuth()
@Controller("challenges")
export class ChallengesController {
  constructor(
    private readonly createChallengeUseCase: CreateChallengeUseCase,
    private readonly updateChallengeUseCase: UpdateChallengeUseCase,
    private readonly listChallengesUseCase: ListChallengesUseCase,
    private readonly getChallengeUseCase: GetChallengeUseCase,
    private readonly deleteChallengeUseCase: DeleteChallengeUseCase,
  ) {}

  @Post()
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Create a new challenge" })
  async create(@Body() dto: CreateChallengeDto, @CurrentUser() user: any) {
    return this.createChallengeUseCase.execute(dto, user.id, user.role);
  }

  @Get()
  @ApiOperation({ summary: "List all challenges" })
  async list(@CurrentUser() user: any, @Query('groupId') groupId?: string) {
    return this.listChallengesUseCase.execute(user.role, groupId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get challenge by ID" })
  async get(@Param('id') id: string, @CurrentUser() user: any) {
    return this.getChallengeUseCase.execute(id, user.role);
  }

  @Patch(":id")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Update challenge" })
  async update(@Param('id') id: string, @Body() dto: UpdateChallengeDto, @CurrentUser() user: any) {
    return this.updateChallengeUseCase.execute(id, dto, user.id, user.role);
  }
  
  @Delete(":id")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Delete challenge" })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deleteChallengeUseCase.execute(id, user.id, user.role);
  }
}