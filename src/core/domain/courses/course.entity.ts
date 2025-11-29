interface CourseProps {
  id: string;
  name: string;
  code: string; // se usa como NRC identificador
  professorIds: string[];
  studentIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Course {
  public readonly id: string;
  public readonly name: string;
  public readonly code: string;

  public readonly professorIds: string[];
  public readonly studentIds?: string[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: CourseProps) {
    this.id = props.id;
    this.name = props.name;
    this.code = props.code;

    this.professorIds = props.professorIds;
    this.studentIds = props.studentIds;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isProfessor(userId: string): boolean {
    return this.professorIds.includes(userId);
  }
}

interface CourseStudentProps {
  courseId: string;
  studentId: string;
  enrolledAt: Date;
}

export class CourseStudent {
  public readonly courseId: string;
  public readonly studentId: string;
  public readonly enrolledAt: Date;

  constructor(props: CourseStudentProps) {
    this.courseId = props.courseId;
    this.studentId = props.studentId;
    this.enrolledAt = props.enrolledAt;
  }
}