import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { GROUP_REPOSITORY, GroupRepository } from "@core/domain/groups/group.repository.port";
import { GroupDto } from "../dto/group.dto";

@Injectable()
export class GetGroupUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(id: string): Promise<GroupDto> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException("Grupo no encontrado");
    }
    return this.toDto(group);
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
