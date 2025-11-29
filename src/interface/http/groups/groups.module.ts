import { Module } from "@nestjs/common";
import { GroupsController } from "./groups.controller";
import { CreateGroupUseCase } from "@core/application/groups/usecases/create-group.usecase";
import { ListGroupsUseCase } from "@core/application/groups/usecases/list-groups.usecase";
import { GetGroupUseCase } from "@core/application/groups/usecases/get-group.usecase";
import { GetGroupByCourseAndNumberUseCase } from "@core/application/groups/usecases/get-group-by-course-and-number.usecase";
import { UpdateGroupUseCase } from "@core/application/groups/usecases/update-group.usecase";
import { DeleteGroupUseCase } from "@core/application/groups/usecases/delete-group.usecase";
import { EnrollStudentToGroupUseCase } from "@core/application/groups/usecases/enroll-student-to-group.usecase";
import { GROUP_REPOSITORY } from "@core/domain/groups/group.repository.port";
import { GroupPrismaRepository } from "@infrastructure/database/prisma/group-prisma.repository";
import { PrismaService } from "@infrastructure/database/prisma.service";

@Module({
  controllers: [GroupsController],
  providers: [
    CreateGroupUseCase,
    ListGroupsUseCase,
    GetGroupUseCase,
    GetGroupByCourseAndNumberUseCase,
    UpdateGroupUseCase,
    DeleteGroupUseCase,
    EnrollStudentToGroupUseCase,
    PrismaService,
    {
      provide: GROUP_REPOSITORY,
      useClass: GroupPrismaRepository,
    },
  ],
  exports: [GROUP_REPOSITORY],
})
export class GroupsModule {}
