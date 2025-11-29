import { Course } from '@core/domain/courses/course.entity';
import { CourseDto } from '../dto/course.dto';
import { Group } from '@core/domain/groups/group.repository.port';
import { GroupMapper } from '../../groups/mappers/group.mapper';

export class CourseMapper {
  static toDto(entity: Course, groups?: Group[]): CourseDto {
    return {
      id: entity.id,
      name: entity.name,
      code: entity.code,
      professorIds: entity.professorIds,
      groups: groups ? groups.map((g) => GroupMapper.toDto(g)) : undefined,
    };
  }
}