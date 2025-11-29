import { Inject, Injectable, ForbiddenException } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { Course } from "@core/domain/courses/course.entity";
import { UserRole } from "@core/domain/users/user.entity";
import { CreateCourseDto } from "../dto/create-course.dto";
import { CourseDto } from "../dto/course.dto";
import { CourseMapper } from "../mappers/course.mapper";

@Injectable()
export class CreateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  async execute(dto: CreateCourseDto, userRole: UserRole): Promise<CourseDto> {
    if (userRole !== UserRole.PROFESSOR) {
      throw new ForbiddenException("Solo profesores pueden crear cursos");
    }

    const course = new Course({
      id: uuidv4(),
      name: dto.name,
      code: dto.code,
      professorIds: [dto.professorId],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdCourse = await this.courseRepository.create(course);
    return CourseMapper.toDto(createdCourse);
  }
}