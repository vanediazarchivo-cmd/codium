import { Inject, Injectable, NotFoundException, ForbiddenException, ConflictException } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { USER_REPOSITORY, UserRepositoryPort } from "@core/domain/users/user.repository.port";
import { CourseStudent } from "@core/domain/courses/course.entity";
import { UserRole } from "@core/domain/users/user.entity";

@Injectable()
export class EnrollStudentUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(courseId: string, studentId: string, requestUserId: string, requestUserRole: UserRole): Promise<void> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new NotFoundException("Curso no encontrado");

    if (requestUserRole !== UserRole.PROFESSOR && !course.isProfessor(requestUserId)) {
      throw new ForbiddenException("No tienes permiso para inscribir estudiantes en este curso");
    }

    const student = await this.userRepository.findById(studentId);
    if (!student) throw new NotFoundException("Estudiante no encontrado");
    if (!student.isStudent()) throw new ForbiddenException("Solo se pueden inscribir usuarios con rol STUDENT");

    const isEnrolled = await this.courseRepository.isStudentEnrolled(courseId, studentId);
    if (isEnrolled) throw new ConflictException("El estudiante ya está inscrito en este curso");

    const courseStudent = new CourseStudent({
      courseId,
      studentId,
      enrolledAt: new Date(),
    });

    await this.courseRepository.enrollStudent(courseStudent);
  }
}