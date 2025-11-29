export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum ChallengeStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

interface ChallengeProps {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  timeLimit: number;
  memoryLimit: number;
  status: ChallengeStatus;
  groupId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Challenge {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly difficulty: Difficulty;
  public readonly tags: string[];
  public readonly timeLimit: number;
  public readonly memoryLimit: number;
  public readonly status: ChallengeStatus;
  public readonly groupId: string;
  public readonly createdById: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  
  constructor(props: ChallengeProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.difficulty = props.difficulty;
    this.tags = props.tags;
    this.timeLimit = props.timeLimit;
    this.memoryLimit = props.memoryLimit;
    this.status = props.status;
    this.groupId = props.groupId;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isPublished(): boolean {
    return this.status === ChallengeStatus.PUBLISHED;
  }

  isDraft(): boolean {
    return this.status === ChallengeStatus.DRAFT;
  }

  canBeViewedByStudent(): boolean {
    return this.isPublished();
  }
}