import { Injectable, NotFoundException, BadRequestException, Inject } from "@nestjs/common";
import { GROUP_REPOSITORY, GroupRepository } from "@core/domain/groups/group.repository.port";

@Injectable()
export class EnrollStudentToGroupUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(groupId: string, studentId: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException("Grupo no encontrado");
    }

    const isEnrolled = await this.groupRepository.isStudentEnrolled(groupId, studentId);
    if (isEnrolled) {
      throw new BadRequestException("El estudiante ya está inscrito en este grupo");
    }

    await this.groupRepository.enrollStudent(groupId, studentId);
  }
}
