import { Evaluation } from "./evaluation.entity";

export interface EvaluationRepositoryPort {
  create(evaluation: Evaluation, challengeIds: string[]): Promise<Evaluation>;
  findById(id: string): Promise<Evaluation | null>;
  findByGroupId(groupId: string): Promise<Evaluation[]>;
  findAll(): Promise<Evaluation[]>;
  update(id: string, data: Partial<Evaluation>): Promise<Evaluation>;
  delete(id: string): Promise<void>;
  
  addChallengeToEvaluation(evaluationId: string, challengeId: string, order: number): Promise<void>;
  removeChallengeFromEvaluation(evaluationId: string, challengeId: string): Promise<void>;
  getChallengesByEvaluationId(evaluationId: string): Promise<string[]>;
}

export const EVALUATION_REPOSITORY = Symbol("EVALUATION_REPOSITORY");
