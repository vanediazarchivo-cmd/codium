import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { GROUP_REPOSITORY, GroupRepository } from "@core/domain/groups/group.repository.port";

@Injectable()
export class DeleteGroupUseCase {
  constructor(
    @Inject(GROUP_REPOSITORY)
    private readonly groupRepository: GroupRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException("Grupo no encontrado");
    }

    await this.groupRepository.delete(id);
  }
}
