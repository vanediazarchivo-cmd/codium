import { Injectable, Inject } from "@nestjs/common";
import { GROUP_REPOSITORY, GroupRepository } from "@core/domain/groups/group.repository.port";
import { GroupDto } from "../dto/group.dto";

@Injectable()
export class ListGroupsUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(courseId: string): Promise<GroupDto[]> {
    const groups = await this.groupRepository.findByCourseId(courseId);
    return groups.map((g) => this.toDto(g));
  }

  private toDto(group: any): GroupDto {
    return {
      id: group.id,
      courseId: group.courseId,
      number: group.number,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }
}
