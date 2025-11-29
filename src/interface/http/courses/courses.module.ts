import { Module } from "@nestjs/common";
import { CoursesController } from "./courses.controller";
import { CreateCourseUseCase } from "@core/application/courses/usecases/create-course.usecase";
import { ListCoursesUseCase } from "@core/application/courses/usecases/list-courses.usecase";
import { GetCourseUseCase } from "@core/application/courses/usecases/get-course.usecase";
import { UpdateCourseUseCase } from "@core/application/courses/usecases/update-course.usecase";
import { DeleteCourseUseCase } from "@core/application/courses/usecases/delete-course.usecase";
import { EnrollStudentUseCase } from "@core/application/courses/usecases/enroll-student.usecase";
import { ListCourseStudentsUseCase } from "@core/application/courses/usecases/list-course-students.usecase";
import { UnenrollStudentUseCase } from "@core/application/courses/usecases/unenroll-student.usecase";
import { COURSE_REPOSITORY } from "@core/domain/courses/course.repository.port";
import { GROUP_REPOSITORY } from "@core/domain/groups/group.repository.port";
import { USER_REPOSITORY } from "@core/domain/users/user.repository.port";
import { CoursePrismaRepository } from "@infrastructure/database/prisma/course-prisma.repository";
import { GroupPrismaRepository } from "@infrastructure/database/prisma/group-prisma.repository";
import { UserPrismaRepository } from "@infrastructure/database/prisma/user-prisma.repository";
import { PrismaService } from "@infrastructure/database/prisma.service";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [UsersModule],
  controllers: [CoursesController],
  providers: [
    CreateCourseUseCase,
    ListCoursesUseCase,
    GetCourseUseCase,
    UpdateCourseUseCase,
    DeleteCourseUseCase,
    EnrollStudentUseCase,
    ListCourseStudentsUseCase,
    UnenrollStudentUseCase,
    PrismaService,
    {
      provide: COURSE_REPOSITORY,
      useClass: CoursePrismaRepository,
    },
    {
      provide: GROUP_REPOSITORY,
      useClass: GroupPrismaRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: UserPrismaRepository,
    },
  ],
})
export class CoursesModule {}