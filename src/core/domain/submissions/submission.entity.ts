export enum SubmissionStatus {
  QUEUED = "QUEUED",
  RUNNING = "RUNNING",
  ACCEPTED = "ACCEPTED",
  WRONG_ANSWER = "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  COMPILATION_ERROR = "COMPILATION_ERROR",
}

export enum Language {
  PYTHON = "PYTHON",
  JAVA = "JAVA",
  NODEJS = "NODEJS",
  CPP = "CPP",
}

export interface TestCaseResult {
  testCaseId: string;
  status: SubmissionStatus;
  timeMs: number;
  memoryMb: number;
  output?: string;
  error?: string;
}

interface SubmissionProps {
  id: string;
  userId: string;
  challengeId: string;
  groupId: string;
  evaluationId?: string | null;
  code: string;
  language: Language;
  status: SubmissionStatus;
  score: number;
  timeMsTotal: number;
  memoryUsedMb: number;
  results: TestCaseResult[];
  createdAt: Date;
  updatedAt: Date;
}

export class Submission {
  public readonly id: string;
  public readonly userId: string;
  public readonly challengeId: string;
  public readonly groupId: string;
  public readonly evaluationId?: string | null;
  public readonly code: string;
  public readonly language: Language;
  public readonly status: SubmissionStatus;
  public readonly score: number;
  public readonly timeMsTotal: number;
  public readonly memoryUsedMb: number;
  public readonly results: TestCaseResult[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: SubmissionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.challengeId = props.challengeId;
    this.groupId = props.groupId;
    this.evaluationId = props.evaluationId || undefined;
    this.code = props.code;
    this.language = props.language;
    this.status = props.status;
    this.score = props.score;
    this.timeMsTotal = props.timeMsTotal;
    this.memoryUsedMb = props.memoryUsedMb;
    this.results = props.results;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isAccepted(): boolean {
    return this.status === SubmissionStatus.ACCEPTED;
  }

  isPending(): boolean {
    return this.status === SubmissionStatus.QUEUED || this.status === SubmissionStatus.RUNNING;
  }

  hasError(): boolean {
    return [
      SubmissionStatus.WRONG_ANSWER,
      SubmissionStatus.TIME_LIMIT_EXCEEDED,
      SubmissionStatus.RUNTIME_ERROR,
      SubmissionStatus.COMPILATION_ERROR,
    ].includes(this.status);
  }
}