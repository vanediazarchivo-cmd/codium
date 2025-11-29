export enum UserRole {
  STUDENT = "STUDENT",
  PROFESSOR = "PROFESSOR",
}

interface UserProps {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
  isProfessor(): boolean {
    return this.role === UserRole.PROFESSOR;
  }

  isStudent(): boolean {
    return this.role === UserRole.STUDENT;
  }

  canManageChallenges(): boolean {
    return this.isProfessor();
  }
}