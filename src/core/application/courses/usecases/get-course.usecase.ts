import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { UserRole } from "@core/domain/users/user.entity";
import { CourseDto } from "../dto/course.dto";
import { CourseMapper } from "../mappers/course.mapper";

@Injectable()
export class GetCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  async execute(id: string, userId: string, userRole: UserRole): Promise<CourseDto> {
    const course = await this.courseRepository.findById(id);
    if (!course) throw new NotFoundException("Curso no encontrado");

    if (userRole === UserRole.PROFESSOR && course.isProfessor(userId)) {
      return CourseMapper.toDto(course);
    }
    
    if (userRole === UserRole.STUDENT) {
      const isEnrolled = await this.courseRepository.isStudentEnrolled(id, userId);
      if (isEnrolled) return CourseMapper.toDto(course);
    }

    throw new ForbiddenException("No tienes acceso a este curso");
  }
}