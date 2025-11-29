import type { Challenge } from "@core/domain/challenges/challenge.entity"
import type { ChallengeDto } from "../dto/challenge.dto"

export class ChallengeMapper {
  static toDto(challenge: Challenge): ChallengeDto {
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      tags: challenge.tags,
      timeLimit: challenge.timeLimit,
      memoryLimit: challenge.memoryLimit,
      status: challenge.status,
      groupId: challenge.groupId,
      createdBy: challenge.createdById,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }
  }

  static toDtoArray(challenges: Challenge[]): ChallengeDto[] {
    return challenges.map(this.toDto)
  }
}
