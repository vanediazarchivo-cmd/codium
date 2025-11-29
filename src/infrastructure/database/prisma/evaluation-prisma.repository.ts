import { Injectable } from "@nestjs/common";
import { Evaluation, EvaluationStatus } from "@core/domain/evaluations/evaluation.entity";
import { EvaluationRepositoryPort } from "@core/domain/evaluations/evaluation.repository.port";
import { PrismaService } from "../prisma.service";

@Injectable()
export class EvaluationPrismaRepository implements EvaluationRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(evaluation: Evaluation, challengeIds: string[]): Promise<Evaluation> {
    const created = await this.prisma.evaluation.create({
      data: {
        id: evaluation.id,
        name: evaluation.name,
        description: evaluation.description,
          groupId: evaluation.groupId,
        status: evaluation.status,
        startDate: evaluation.startDate,
        endDate: evaluation.endDate,
        challenges: {
          create: challengeIds.map((id, index) => ({
            challengeId: id,
            order: index,
          })),
        },
      },
      include: { challenges: true },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Evaluation | null> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
      include: { challenges: true },
    });

    return evaluation ? this.toDomain(evaluation) : null;
  }

  async findByGroupId(groupId: string): Promise<Evaluation[]> {
    const evaluations = await this.prisma.evaluation.findMany({
      where: { groupId },
      include: { challenges: true },
      orderBy: { startDate: "desc" },
    });

    return evaluations.map(e => this.toDomain(e));
  }

  async findAll(): Promise<Evaluation[]> {
    const evaluations = await this.prisma.evaluation.findMany({
      include: { challenges: true },
      orderBy: { startDate: "desc" },
    });

    return evaluations.map(e => this.toDomain(e));
  }

  async update(id: string, data: Partial<Evaluation>): Promise<Evaluation> {
    const updated = await this.prisma.evaluation.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        updatedAt: data.updatedAt,
      },
      include: { challenges: true },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.evaluation.delete({
      where: { id },
    });
  }

  async addChallengeToEvaluation(evaluationId: string, challengeId: string, order: number): Promise<void> {
    await this.prisma.evaluationChallenge.create({
      data: {
        evaluationId,
        challengeId,
        order,
      },
    });
  }

  async removeChallengeFromEvaluation(evaluationId: string, challengeId: string): Promise<void> {
    await this.prisma.evaluationChallenge.delete({
      where: {
        evaluationId_challengeId: {
          evaluationId,
          challengeId,
        },
      },
    });
  }

  async getChallengesByEvaluationId(evaluationId: string): Promise<string[]> {
    const challenges = await this.prisma.evaluationChallenge.findMany({
      where: { evaluationId },
      orderBy: { order: "asc" },
      select: { challengeId: true },
    });

    return challenges.map(c => c.challengeId);
  }

  private toDomain(prismaEvaluation: any): Evaluation {
    return new Evaluation({
      id: prismaEvaluation.id,
      name: prismaEvaluation.name,
      description: prismaEvaluation.description,
        groupId: prismaEvaluation.groupId,
      status: prismaEvaluation.status,
      startDate: prismaEvaluation.startDate,
      endDate: prismaEvaluation.endDate,
      challengeIds: (prismaEvaluation.challenges || []).map((c: any) => c.challengeId),
      createdAt: prismaEvaluation.createdAt,
      updatedAt: prismaEvaluation.updatedAt,
    });
  }
}
