import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CreateGroupUseCase } from "@core/application/groups/usecases/create-group.usecase";
import { ListGroupsUseCase } from "@core/application/groups/usecases/list-groups.usecase";
import { GetGroupUseCase } from "@core/application/groups/usecases/get-group.usecase";
import { GetGroupByCourseAndNumberUseCase } from "@core/application/groups/usecases/get-group-by-course-and-number.usecase";
import { UpdateGroupUseCase } from "@core/application/groups/usecases/update-group.usecase";
import { DeleteGroupUseCase } from "@core/application/groups/usecases/delete-group.usecase";
import { EnrollStudentToGroupUseCase } from "@core/application/groups/usecases/enroll-student-to-group.usecase";
import { CreateGroupDto } from "@core/application/groups/dto/create-group.dto";
import { UpdateGroupDto } from "@core/application/groups/dto/update-group.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@core/domain/users/user.entity";

@ApiTags("groups")
@ApiBearerAuth()
@Controller("groups")
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly listGroupsUseCase: ListGroupsUseCase,
    private readonly getGroupUseCase: GetGroupUseCase,
    private readonly getGroupByCourseAndNumberUseCase: GetGroupByCourseAndNumberUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly deleteGroupUseCase: DeleteGroupUseCase,
    private readonly enrollStudentUseCase: EnrollStudentToGroupUseCase,
  ) {}

  @Post()
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Create a new group" })
  async create(@Body() dto: CreateGroupDto) {
    return this.createGroupUseCase.execute(
      dto.courseId,
      dto.number,
      dto.name,
      dto.description,
    );
  }

  @Get()
  @ApiOperation({ summary: "List groups by course" })
  async list(@Query("courseId") courseId: string) {
    if (!courseId) {
      throw new Error("courseId query parameter is required");
    }
    return this.listGroupsUseCase.execute(courseId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get group by ID" })
  async get(@Param("id") id: string) {
    return this.getGroupUseCase.execute(id);
  }

  @Get("course/:courseId/number/:number")
  @ApiOperation({ summary: "Get group by course ID and group number" })
  async getByNumber(
    @Param("courseId") courseId: string,
    @Param("number") number: string,
  ) {
    return this.getGroupByCourseAndNumberUseCase.execute(courseId, parseInt(number, 10));
  }

  @Patch(":id")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Update group" })
  async update(@Param("id") id: string, @Body() dto: UpdateGroupDto) {
    return this.updateGroupUseCase.execute(id, dto);
  }

  @Delete(":id")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Delete group" })
  async delete(@Param("id") id: string) {
    await this.deleteGroupUseCase.execute(id);
    return { message: "Grupo eliminado" };
  }

  @Post(":id/students")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Enroll student in group" })
  async enrollStudent(
    @Param("id") groupId: string,
    @Body() body: { studentId: string },
  ) {
    await this.enrollStudentUseCase.execute(groupId, body.studentId);
    return { message: "Estudiante inscrito en el grupo" };
  }
}
