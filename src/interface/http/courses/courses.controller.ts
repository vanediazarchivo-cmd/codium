import { Controller, Get, Post, Patch, Delete, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CreateCourseUseCase } from "@core/application/courses/usecases/create-course.usecase";
import { ListCoursesUseCase } from "@core/application/courses/usecases/list-courses.usecase";
import { GetCourseUseCase } from "@core/application/courses/usecases/get-course.usecase";
import { UpdateCourseUseCase } from "@core/application/courses/usecases/update-course.usecase";
import { DeleteCourseUseCase } from "@core/application/courses/usecases/delete-course.usecase";
import { EnrollStudentUseCase } from "@core/application/courses/usecases/enroll-student.usecase";
import { ListCourseStudentsUseCase } from "@core/application/courses/usecases/list-course-students.usecase";
import { UnenrollStudentUseCase } from "@core/application/courses/usecases/unenroll-student.usecase";
import { CreateCourseDto } from "@core/application/courses/dto/create-course.dto";
import { UpdateCourseDto } from "@core/application/courses/dto/update-course.dto";
import { EnrollStudentDto } from "@core/application/courses/dto/enroll-student.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@core/domain/users/user.entity";

@ApiTags("courses")
@ApiBearerAuth()
@Controller("courses")
export class CoursesController {
  constructor(
    private readonly createCourseUseCase: CreateCourseUseCase,
    private readonly listCoursesUseCase: ListCoursesUseCase,
    private readonly getCourseUseCase: GetCourseUseCase,
    private readonly updateCourseUseCase: UpdateCourseUseCase,
    private readonly deleteCourseUseCase: DeleteCourseUseCase,
    private readonly enrollStudentUseCase: EnrollStudentUseCase,
    private readonly listCourseStudentsUseCase: ListCourseStudentsUseCase,
    private readonly unenrollStudentUseCase: UnenrollStudentUseCase,
  ) {}

  @Post()
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Create a new course" })
  async create(@Body() dto: CreateCourseDto, @CurrentUser() user: any) {
    return this.createCourseUseCase.execute(dto, user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List all courses' })
  async list(@CurrentUser() user: any) {
    return this.listCoursesUseCase.execute(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async get(@Param('id') id: string, @CurrentUser() user: any) {
    return this.getCourseUseCase.execute(id, user.id, user.role);
  }

  @Patch(':id')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Update a course" })
  async update(@Param('id') courseId: string, @Body() dto: UpdateCourseDto, @CurrentUser() user: any) {
    return this.updateCourseUseCase.execute(courseId, dto, user.role);
  }

  @Delete(':id')
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Delete a course" })
  async delete(@Param('id') courseId: string, @CurrentUser() user: any) {
    return this.deleteCourseUseCase.execute(courseId, user.role);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'List students enrolled in a course' })
  async getStudents(@Param('id') courseId: string, @CurrentUser() user: any) {
    return this.listCourseStudentsUseCase.execute(courseId, user.id, user.role);
  }

  @Post(":id/students")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Enroll student in course" })
  async enrollStudent(@Param('id') courseId: string, @Body() dto: EnrollStudentDto, @CurrentUser() user: any) {
    return this.enrollStudentUseCase.execute(courseId, dto.studentId, user.id, user.role);
  }

  @Post(":id/students/:studentId/unenroll")
  @Roles(UserRole.PROFESSOR)
  @ApiOperation({ summary: "Unenroll student from course" })
  async unenrollStudent(@Param('id') courseId: string, @Param('studentId') studentId: string, @CurrentUser() user: any) {
    return this.unenrollStudentUseCase.execute(courseId, studentId, user.id, user.role);
  }
}