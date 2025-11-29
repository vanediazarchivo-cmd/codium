import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { GetUserUseCase } from "@core/application/users/usecases/get-user.usecase";
import { ListUsersUseCase } from "@core/application/users/usecases/list-users.usecase";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@core/domain/users/user.entity";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Get()
    @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "List all users (Professors only)" })
    async list() {
    return this.listUsersUseCase.execute();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  async getUser(@Param("id") id: string) {
    return this.getUserUseCase.execute(id);
  }
}