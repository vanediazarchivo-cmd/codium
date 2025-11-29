import { Inject, Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { USER_REPOSITORY, UserRepositoryPort } from "@core/domain/users/user.repository.port";
import { UserRole } from "@core/domain/users/user.entity";
import { UserDto } from "../../users/dto/user.dto";
import { UserMapper } from "../../users/mappers/user.mapper";

@Injectable()
export class ListCourseStudentsUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(courseId: string, requestUserId: string, requestUserRole: UserRole): Promise<UserDto[]> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException("Curso no encontrado");
    }

    if (requestUserRole !== UserRole.PROFESSOR && !course.isProfessor(requestUserId)) {
      throw new ForbiddenException("No tienes permiso para ver los estudiantes de este curso");
    }

    const students = await this.courseRepository.findStudentsByCourseId(courseId);
    return students.map(student => UserMapper.toDto(student));
  }
}