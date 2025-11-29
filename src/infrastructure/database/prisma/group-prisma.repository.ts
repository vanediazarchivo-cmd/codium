import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Group, GroupRepository } from "@core/domain/groups/group.repository.port";

@Injectable()
export class GroupPrismaRepository implements GroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(group: Group): Promise<Group> {
    const created = await this.prisma.group.create({
      data: {
        courseId: group.courseId,
        number: group.number,
        name: group.name,
        description: group.description,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
    });
    return group ? this.toDomain(group) : null;
  }

  async findByCourseId(courseId: string): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: { courseId },
      orderBy: { number: "asc" },
    });
    return groups.map((g) => this.toDomain(g));
  }

  async findByCourseIdAndNumber(courseId: string, number: number): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: { courseId_number: { courseId, number } },
    });
    return group ? this.toDomain(group) : null;
  }

  async update(id: string, data: Partial<Group>): Promise<Group> {
    const { id: groupId, createdAt, updatedAt, ...updateData } = data;
    const updated = await this.prisma.group.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.group.delete({
      where: { id },
    });
  }

  async enrollStudent(groupId: string, studentId: string): Promise<void> {
    await this.prisma.groupStudent.create({
      data: {
        groupId,
        studentId,
      },
    });
  }

  async unenrollStudent(groupId: string, studentId: string): Promise<void> {
    await this.prisma.groupStudent.delete({
      where: { groupId_studentId: { groupId, studentId } },
    });
  }

  async isStudentEnrolled(groupId: string, studentId: string): Promise<boolean> {
    const enrollment = await this.prisma.groupStudent.findUnique({
      where: { groupId_studentId: { groupId, studentId } },
    });
    return !!enrollment;
  }

  private toDomain(prismaGroup: any): Group {
    return {
      id: prismaGroup.id,
      courseId: prismaGroup.courseId,
      number: prismaGroup.number,
      name: prismaGroup.name,
      description: prismaGroup.description,
      createdAt: prismaGroup.createdAt,
      updatedAt: prismaGroup.updatedAt,
    };
  }
}
