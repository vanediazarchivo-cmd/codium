export enum EvaluationStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CLOSED = "CLOSED",
}

interface EvaluationProps {
  id: string;
  name: string;
  description?: string;
  groupId: string;
  status: EvaluationStatus;
  startDate: Date;
  endDate: Date;
  challengeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Evaluation {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly groupId: string;
  public readonly status: EvaluationStatus;
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly challengeIds: string[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: EvaluationProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.groupId = props.groupId;
    this.status = props.status;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.challengeIds = props.challengeIds;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPublished(): boolean {
    return this.status === EvaluationStatus.PUBLISHED;
  }

  isDraft(): boolean {
    return this.status === EvaluationStatus.DRAFT;
  }

  isClosed(): boolean {
    return this.status === EvaluationStatus.CLOSED;
  }

  isActive(): boolean {
    const now = new Date();
    return this.isPublished() && now >= this.startDate && now <= this.endDate;
  }

  hasStarted(): boolean {
    return new Date() >= this.startDate;
  }

  hasEnded(): boolean {
    return new Date() > this.endDate;
  }
}
