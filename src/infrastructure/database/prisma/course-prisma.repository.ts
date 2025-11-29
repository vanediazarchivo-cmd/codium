import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { Course, CourseStudent } from "@core/domain/courses/course.entity";
import { User } from "@core/domain/users/user.entity";

@Injectable()
export class CoursePrismaRepository implements CourseRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(course: Course): Promise<Course> {
    const created = await this.prisma.course.create({
      data: {
        id: course.id,
        name: course.name,
        code: course.code,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        professors: {
          connect: course.professorIds.map((id) => ({ id })),
        },
      },
      include: { professors: { select: { id: true } } },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { professors: { select: { id: true } } },
    });
    return course ? this.toDomain(course) : null;
  }

  async findAll(): Promise<Course[]> {
    const courses = await this.prisma.course.findMany({
      include: { professors: { select: { id: true } } },
    });
    return courses.map((c) => this.toDomain(c));
  }
  
  async findByProfessorId(professorId: string): Promise<Course[]> {
    const courses = await this.prisma.course.findMany({
        where: { professors: { some: { id: professorId } } },
        include: { professors: { select: { id: true } } }
    });
    return courses.map(c => this.toDomain(c));
  }

  async findCoursesByStudentId(studentId: string): Promise<Course[]> {
      const courses = await this.prisma.course.findMany({
          where: { students: { some: { studentId } } },
          include: { professors: { select: { id: true } } }
      });
      return courses.map(c => this.toDomain(c));
  }

  async update(id: string, data: Partial<Course>): Promise<Course> {
    const updated = await this.prisma.course.update({
      where: { id },
      data,
      include: { professors: { select: { id: true } } },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } });
  }

  async enrollStudent(enrollment: CourseStudent): Promise<void> {
    await this.prisma.courseStudent.create({
      data: {
        courseId: enrollment.courseId,
        studentId: enrollment.studentId,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  }

  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    await this.prisma.courseStudent.delete({
      where: { courseId_studentId: { courseId, studentId } },
    });
  }

  async isStudentEnrolled(courseId: string, studentId: string): Promise<boolean> {
      const enrollment = await this.prisma.courseStudent.findUnique({
          where: { courseId_studentId: { courseId, studentId } }
      });
      return !!enrollment;
  }

  async findStudentsByCourseId(courseId: string): Promise<User[]> {
      const enrollments = await this.prisma.courseStudent.findMany({
          where: { courseId },
          include: { student: true }
      });
      return enrollments.map(e => e.student as any);
  }

  private toDomain(prismaCourse: any): Course {
    return new Course({
      id: prismaCourse.id,
      name: prismaCourse.name,
      code: prismaCourse.code,
      professorIds: prismaCourse.professors.map((p: any) => p.id),
      createdAt: prismaCourse.createdAt,
      updatedAt: prismaCourse.updatedAt,
    });
  }
}