import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { PrismaService } from '@infrastructure/database/prisma.service'
import { UserRole } from '@core/domain/users/user.entity'

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getMyEnrollments(@Request() req: any) {
    const userId = req.user.id
    // Obtener los cursos en los que el usuario está inscrito
    const enrollments = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        coursesEnrolled: {
          include: {
            course: {
              include: {
                professors: { select: { id: true, firstName: true, lastName: true } },
                groups: { include: { students: true } },
              },
            },
          },
        },
      },
    })

    return (enrollments?.coursesEnrolled || []).map((e: any) => e.course)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async enrollInCourse(@Request() req: any, @Body() data: { courseId: string }) {
    const userId = req.user.id
    // Crear un registro en la tabla course_students
    await this.prisma.courseStudent.create({
      data: {
        courseId: data.courseId,
        studentId: userId,
      },
    })

    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
      include: { students: true, groups: { include: { students: true } } },
    })

    return {
      message: 'Enrolled successfully',
      course,
    }
  }
}
