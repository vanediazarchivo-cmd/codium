import { Injectable, BadRequestException, Inject } from "@nestjs/common";
import { GROUP_REPOSITORY, GroupRepository, Group } from "@core/domain/groups/group.repository.port";
import { GroupDto } from "../dto/group.dto";

@Injectable()
export class CreateGroupUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(courseId: string, number: number, name: string, description?: string): Promise<GroupDto> {
    // Validar que no exista otro grupo con el mismo número en el curso
    const existing = await this.groupRepository.findByCourseIdAndNumber(courseId, number);
    if (existing) {
      throw new BadRequestException(`Grupo ${number} ya existe en este curso`);
    }

    const group: Group = {
      id: undefined!,
      courseId,
      number,
      name,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.groupRepository.create(group);
    return this.toDto(created);
  }

  private toDto(group: Group): GroupDto {
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
