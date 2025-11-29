import { Group } from "@core/domain/groups/group.repository.port";
import { GroupDto } from "../dto/group.dto";

export class GroupMapper {
  static toDto(group: Group): GroupDto {
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
