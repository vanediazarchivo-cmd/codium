import { Inject, Injectable } from "@nestjs/common";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { UserRole } from "@core/domain/users/user.entity";
import { CourseDto } from "../dto/course.dto";
import { CourseMapper } from "../mappers/course.mapper";
import { Course } from "@core/domain/courses/course.entity";

@Injectable()
export class ListCoursesUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  async execute(userId: string, userRole: UserRole): Promise<CourseDto[]> {
    let courses: Course[] = []; 
    
    if (userRole === UserRole.PROFESSOR) {
      courses = await this.courseRepository.findByProfessorId(userId);
    } else {
      courses = await this.courseRepository.findCoursesByStudentId(userId);
    }
    
    return courses.map(course => CourseMapper.toDto(course));
  }
}