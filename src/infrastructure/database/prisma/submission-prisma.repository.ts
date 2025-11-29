import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { SubmissionRepositoryPort } from "@core/domain/submissions/submission.repository.port";
import { Submission, SubmissionStatus, Language, TestCaseResult } from "@core/domain/submissions/submission.entity";

@Injectable()
export class SubmissionPrismaRepository implements SubmissionRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(submission: Submission): Promise<Submission> {
    const createData: any = {
      id: submission.id,
      userId: submission.userId,
      challengeId: submission.challengeId,
      groupId: submission.groupId,
      code: submission.code,
      language: submission.language,
      status: submission.status,
    };

    // Agregar evaluationId solo si está definido
    if (submission.evaluationId) {
      createData.evaluationId = submission.evaluationId;
    }

    const created = await this.prisma.submission.create({
      data: createData,
      include: { results: true },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Submission | null> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { results: true },
    });
    return submission ? this.toDomain(submission) : null;
  }

  async findByUserId(userId: string): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { results: true },
    });
    return submissions.map((s) => this.toDomain(s));
  }

  async findByChallengeId(challengeId: string): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
        where: { challengeId },
        orderBy: { createdAt: "desc" },
        include: { results: true },
    });
    return submissions.map(s => this.toDomain(s));
  }
  
  async findByGroupId(groupId: string): Promise<Submission[]> {
    const submissions = await this.prisma.submission.findMany({
        where: { groupId },
        orderBy: { createdAt: "desc" },
        include: { results: true },
    });
    return submissions.map(s => this.toDomain(s));
  }

  async update(id: string, data: Partial<Submission>): Promise<Submission> {
    const { id: submissionId, createdAt, updatedAt, code, results, ...restOfData } = data;
    
    const updated = await this.prisma.submission.update({
      where: { id },
      data: restOfData,
      include: { results: true },
    });
    return this.toDomain(updated);
  }
  
  async updateStatus(id: string, status: SubmissionStatus, results?: any): Promise<Submission> {
      // Si se proporcionan resultados, crear los TestCaseResult correspondientes
      if (results && Array.isArray(results) && results.length > 0) {
        const createOps = results.map((r: any) => ({
          id: r.id || undefined,
          submissionId: id,
          testCaseId: r.testCaseId,
          status: r.status,
          timeMs: r.timeMs || 0,
          memoryMb: r.memoryMb || 0,
          output: r.output || null,
          error: r.error || null,
        }))

        // Usar createMany si es posible
        try {
          await this.prisma.testCaseResult.createMany({ data: createOps, skipDuplicates: true })
        } catch (e) {
          // Si falla createMany (ej: SQLite), crear uno por uno
          for (const item of createOps) {
            await this.prisma.testCaseResult.create({ data: item })
          }
        }
      }

      // Actualizar submission con el estado y, si llegaron, score/time
      const updateData: any = { status }

      if (results && typeof results === 'object' && results.meta) {
        if (typeof results.meta.score === 'number') updateData.score = results.meta.score
        if (typeof results.meta.timeMsTotal === 'number') updateData.timeMsTotal = results.meta.timeMsTotal
        if (typeof results.meta.memoryUsedMb === 'number') updateData.memoryUsedMb = results.meta.memoryUsedMb
      }

      const updated = await this.prisma.submission.update({ where: { id }, data: updateData, include: { results: true } })
      return this.toDomain(updated)
  }

  private toDomain(prismaSubmission: any): Submission {
    return new Submission({
      id: prismaSubmission.id,
      userId: prismaSubmission.userId,
      challengeId: prismaSubmission.challengeId,
      groupId: prismaSubmission.groupId,
      evaluationId: prismaSubmission.evaluationId || undefined,
      code: prismaSubmission.code,
      language: prismaSubmission.language as Language,
      status: prismaSubmission.status as SubmissionStatus,
      score: prismaSubmission.score,
      timeMsTotal: prismaSubmission.timeMsTotal,
      memoryUsedMb: prismaSubmission.memoryUsedMb,
      results: (prismaSubmission.results || []) as TestCaseResult[],
      createdAt: prismaSubmission.createdAt,
      updatedAt: prismaSubmission.updatedAt,
    });
  }
}