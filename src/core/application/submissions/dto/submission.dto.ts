import { Language, SubmissionStatus } from '@core/domain/submissions/submission.entity';

export class TestCaseResultDto {
  caseId: number;
  status: string; // e.g. OK, WA, TLE, RE, CE
  timeMs: number;
}

export class SubmissionDto {
  id: string;
  studentId: string; // UUID of the user
  studentName: string; // enriched with user fullName from repository
  challengeId: string;
  groupId: string;
  language: string; // frontend-friendly language e.g. "Python", "C++"
  status: string; // e.g. ACCEPTED, WRONG_ANSWER, etc.
  score: number;
  executionTime: string; // e.g. "0.45s"
  submittedAt: string; // ISO format timestamp for frontend
  createdAt: Date;
  testCases: TestCaseResultDto[];
}