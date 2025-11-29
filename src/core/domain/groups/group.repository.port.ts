export interface Group {
  id: string;
  courseId: string;
  number: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupRepository {
  create(group: Group): Promise<Group>;
  findById(id: string): Promise<Group | null>;
  findByCourseId(courseId: string): Promise<Group[]>;
  findByCourseIdAndNumber(courseId: string, number: number): Promise<Group | null>;
  update(id: string, data: Partial<Group>): Promise<Group>;
  delete(id: string): Promise<void>;
  enrollStudent(groupId: string, studentId: string): Promise<void>;
  unenrollStudent(groupId: string, studentId: string): Promise<void>;
  isStudentEnrolled(groupId: string, studentId: string): Promise<boolean>;
}

export const GROUP_REPOSITORY = Symbol("GROUP_REPOSITORY");
