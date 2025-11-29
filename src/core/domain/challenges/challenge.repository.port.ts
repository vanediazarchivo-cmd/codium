import { Challenge, ChallengeStatus } from "./challenge.entity";

export interface ChallengeRepositoryPort {
  create(challenge: Challenge): Promise<Challenge>;
  findById(id: string): Promise<Challenge | null>;
  findByGroupId(groupId: string): Promise<Challenge[]>;
  findByStatus(status: ChallengeStatus): Promise<Challenge[]>;
  findAll(): Promise<Challenge[]>;
  update(id: string, data: Partial<Challenge>): Promise<Challenge>;
  delete(id: string): Promise<void>;
}

export const CHALLENGE_REPOSITORY = Symbol("CHALLENGE_REPOSITORY");