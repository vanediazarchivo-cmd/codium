import { Submission, SubmissionStatus } from "./submission.entity";

export interface SubmissionRepositoryPort {
  create(submission: Submission): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findByUserId(userId: string): Promise<Submission[]>;
  findByChallengeId(challengeId: string): Promise<Submission[]>;
  findByGroupId(groupId: string): Promise<Submission[]>;
  update(id: string, data: Partial<Submission>): Promise<Submission>;
  updateStatus(id: string, status: SubmissionStatus, results?: any): Promise<Submission>;
}

export const SUBMISSION_REPOSITORY = Symbol("SUBMISSION_REPOSITORY");