import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { UserRole } from "@core/domain/users/user.entity";

@Injectable()
export class UnenrollStudentUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  async execute(courseId: string, studentId: string, requestUserId: string, requestUserRole: UserRole): Promise<void> {
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new NotFoundException("Curso no encontrado");
    }

    if (requestUserRole !== UserRole.PROFESSOR && !course.isProfessor(requestUserId)) {
      throw new ForbiddenException("No tienes permiso para desinscribir estudiantes de este curso");
    }

    await this.courseRepository.unenrollStudent(courseId, studentId);
  }
}