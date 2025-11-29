import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { GROUP_REPOSITORY, GroupRepository } from "@core/domain/groups/group.repository.port";
import { GroupDto } from "../dto/group.dto";
import { GroupMapper } from "../mappers/group.mapper";

@Injectable()
export class GetGroupByCourseAndNumberUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(courseId: string, number: number): Promise<GroupDto> {
    const group = await this.groupRepository.findByCourseIdAndNumber(courseId, number);
    if (!group) {
      throw new NotFoundException(
        `Grupo ${number} no encontrado en curso ${courseId}`,
      );
    }
    return GroupMapper.toDto(group);
  }
}
