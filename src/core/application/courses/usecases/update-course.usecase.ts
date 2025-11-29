import { Inject, Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { UserRole } from "@core/domain/users/user.entity";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { CourseDto } from "../dto/course.dto";
import { CourseMapper } from "../mappers/course.mapper";

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  async execute(
    courseId: string,
    dto: UpdateCourseDto,
    userRole: UserRole,
  ): Promise<CourseDto> {
    if (userRole !== UserRole.PROFESSOR) {
      throw new ForbiddenException("Solo profesores pueden actualizar cursos");
    }

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException("Curso no encontrado");
    }

    // Preparar datos para actualización (excluir propiedades readonly)
    const updateData: any = {};
    if (dto.name) {
      updateData.name = dto.name;
    }
    if (dto.code) {
      updateData.code = dto.code;
    }
    if (dto.semester !== undefined) {
      updateData.semester = dto.semester;
    }
    if (Object.keys(updateData).length === 0) {
      // Si no hay nada que actualizar, devolver el curso actual
      return CourseMapper.toDto(course);
    }

    const updatedCourse = await this.courseRepository.update(courseId, updateData);
    return CourseMapper.toDto(updatedCourse);
  }
}

