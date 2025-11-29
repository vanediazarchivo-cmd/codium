import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ChallengeRepositoryPort } from "@core/domain/challenges/challenge.repository.port";
import { Challenge, Difficulty, ChallengeStatus } from "@core/domain/challenges/challenge.entity";

@Injectable()
export class ChallengePrismaRepository implements ChallengeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(challenge: Challenge): Promise<Challenge> {
    const created = await this.prisma.challenge.create({
      data: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        difficulty: challenge.difficulty,
        tags: challenge.tags,
        timeLimit: challenge.timeLimit,
        memoryLimit: challenge.memoryLimit,
        status: challenge.status,
        groupId: challenge.groupId,
        createdById: challenge.createdById,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Challenge | null> {
    const challenge = await this.prisma.challenge.findUnique({ where: { id } });
    return challenge ? this.toDomain(challenge) : null;
  }

  async findAll(): Promise<Challenge[]> {
    const challenges = await this.prisma.challenge.findMany();
    return challenges.map(this.toDomain);
  }

  async findByGroupId(groupId: string): Promise<Challenge[]> {
    const challenges = await this.prisma.challenge.findMany({ where: { groupId } });
    return challenges.map(this.toDomain);
  }

  async findByStatus(status: ChallengeStatus): Promise<Challenge[]> {
    const challenges = await this.prisma.challenge.findMany({ where: { status } });
    return challenges.map(this.toDomain);
  }

  async update(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const updated = await this.prisma.challenge.update({ where: { id }, data });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.challenge.delete({ where: { id } });
  }

  private toDomain(prismaChallenge: any): Challenge {
    return new Challenge({
      id: prismaChallenge.id,
      title: prismaChallenge.title,
      description: prismaChallenge.description,
      difficulty: prismaChallenge.difficulty as Difficulty,
      tags: prismaChallenge.tags,
      timeLimit: prismaChallenge.timeLimit,
      memoryLimit: prismaChallenge.memoryLimit,
      status: prismaChallenge.status as ChallengeStatus,
      groupId: prismaChallenge.groupId,
      createdById: prismaChallenge.createdById,
      createdAt: prismaChallenge.createdAt,
      updatedAt: prismaChallenge.updatedAt,
    });
  }
}