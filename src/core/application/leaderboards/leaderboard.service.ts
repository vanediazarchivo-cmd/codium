import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { SUBMISSION_REPOSITORY, SubmissionRepositoryPort } from "@core/domain/submissions/submission.repository.port";
import { CHALLENGE_REPOSITORY, ChallengeRepositoryPort } from "@core/domain/challenges/challenge.repository.port";
import { EVALUATION_REPOSITORY, EvaluationRepositoryPort } from "@core/domain/evaluations/evaluation.repository.port";
import { COURSE_REPOSITORY, CourseRepositoryPort } from "@core/domain/courses/course.repository.port";
import { PrismaService } from "@infrastructure/database/prisma.service";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userEmail: string;
  userName: string;
  score: number;
  submissionsCount: number;
  averageTime: number;
  lastSubmissionAt: Date;
}

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUBMISSION_REPOSITORY)
    private readonly submissionRepository: SubmissionRepositoryPort,
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepository: ChallengeRepositoryPort,
    @Inject(EVALUATION_REPOSITORY)
    private readonly evaluationRepository: EvaluationRepositoryPort,
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: CourseRepositoryPort,
  ) {}

  /**
   * Leaderboard por reto: Ranking de estudiantes ordenado por score y tiempo
   */
  async getChallengeLeaderboard(challengeId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    const challenge = await this.challengeRepository.findById(challengeId);
    if (!challenge) throw new NotFoundException("Challenge not found");

    const submissions = await this.prisma.submission.findMany({
      where: { challengeId },
      include: { user: true },
    });

    // Agrupar por usuario y calcular mejor score
    const userStats = new Map<string, { score: number; time: number; count: number; lastDate: Date; user: any }>();

    for (const submission of submissions) {
      if (submission.status === "ACCEPTED") {
        const key = submission.userId;
        const existing = userStats.get(key);

        if (!existing) {
          userStats.set(key, {
            score: submission.score,
            time: submission.timeMsTotal,
            count: 1,
            lastDate: submission.createdAt,
            user: submission.user,
          });
        } else {
          // Mantener el score más alto
          if (submission.score >= existing.score && submission.timeMsTotal < existing.time) {
            existing.score = submission.score;
            existing.time = submission.timeMsTotal;
          }
          existing.count++;
          existing.lastDate = new Date(Math.max(existing.lastDate.getTime(), submission.createdAt.getTime()));
        }
      }
    }

    // Convertir a array y ordenar
    const entries = Array.from(userStats.entries())
      .map(([userId, stats], index) => ({
        rank: index + 1,
        userId,
        userEmail: stats.user.email,
        userName: `${stats.user.firstName} ${stats.user.lastName}`,
        score: stats.score,
        submissionsCount: stats.count,
        averageTime: Math.round(stats.time / stats.count),
        lastSubmissionAt: stats.lastDate,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.averageTime - b.averageTime;
      })
      .slice(0, limit);

    // Recalcular ranks
    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  /**
   * Leaderboard por curso: Ranking de estudiantes en un curso por score total
   */
  async getCourseLeaderboard(courseId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) throw new NotFoundException("Course not found");

    const submissions = await this.prisma.submission.findMany({
      where: { group: { courseId } },
      include: { user: true },
    });

    const userStats = new Map<string, { totalScore: number; totalTime: number; count: number; lastDate: Date; user: any }>();

    for (const submission of submissions) {
      if (submission.status === "ACCEPTED") {
        const key = submission.userId;
        const existing = userStats.get(key);

        if (!existing) {
          userStats.set(key, {
            totalScore: submission.score,
            totalTime: submission.timeMsTotal,
            count: 1,
            lastDate: submission.createdAt,
            user: submission.user,
          });
        } else {
          existing.totalScore += submission.score;
          existing.totalTime += submission.timeMsTotal;
          existing.count++;
          existing.lastDate = new Date(Math.max(existing.lastDate.getTime(), submission.createdAt.getTime()));
        }
      }
    }

    const entries = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        rank: 0,
        userId,
        userEmail: stats.user.email,
        userName: `${stats.user.firstName} ${stats.user.lastName}`,
        score: Math.round(stats.totalScore / Math.max(1, stats.count)),
        submissionsCount: stats.count,
        averageTime: Math.round(stats.totalTime / stats.count),
        lastSubmissionAt: stats.lastDate,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.averageTime - b.averageTime;
      })
      .slice(0, limit);

    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }

  /**
   * Leaderboard por evaluación: Ranking de estudiantes en una evaluación específica
   */
  async getEvaluationLeaderboard(evaluationId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
    const evaluation = await this.evaluationRepository.findById(evaluationId);
    if (!evaluation) throw new NotFoundException("Evaluation not found");

    // Obtener challenge IDs de la evaluación
    const challengeIds = await this.prisma.evaluationChallenge.findMany({
      where: { evaluationId },
      select: { challengeId: true },
    });

    const submissions = await this.prisma.submission.findMany({
      where: {
        challengeId: { in: challengeIds.map((ec) => ec.challengeId) },
      },
      include: { user: true },
    });

    const userStats = new Map<string, { totalScore: number; totalTime: number; count: number; lastDate: Date; user: any }>();

    for (const submission of submissions) {
      if (submission.status === "ACCEPTED") {
        const key = submission.userId;
        const existing = userStats.get(key);

        if (!existing) {
          userStats.set(key, {
            totalScore: submission.score,
            totalTime: submission.timeMsTotal,
            count: 1,
            lastDate: submission.createdAt,
            user: submission.user,
          });
        } else {
          existing.totalScore += submission.score;
          existing.totalTime += submission.timeMsTotal;
          existing.count++;
          existing.lastDate = new Date(Math.max(existing.lastDate.getTime(), submission.createdAt.getTime()));
        }
      }
    }

    const entries = Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        rank: 0,
        userId,
        userEmail: stats.user.email,
        userName: `${stats.user.firstName} ${stats.user.lastName}`,
        score: Math.round(stats.totalScore / Math.max(1, stats.count)),
        submissionsCount: stats.count,
        averageTime: Math.round(stats.totalTime / stats.count),
        lastSubmissionAt: stats.lastDate,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.averageTime - b.averageTime;
      })
      .slice(0, limit);

    return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }
}
