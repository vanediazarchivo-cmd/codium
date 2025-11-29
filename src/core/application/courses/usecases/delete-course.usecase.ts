import { Inject, Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { UserRole } from "@core/domain/users/user.entity";

@Injectable()
export class DeleteCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  async execute(courseId: string, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.PROFESSOR) {
      throw new ForbiddenException("Solo profesores pueden eliminar cursos");
    }

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException("Curso no encontrado");
    }

    await this.courseRepository.delete(courseId);
  }
}
