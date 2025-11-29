import { ApiProperty } from "@nestjs/swagger"
import { Difficulty, ChallengeStatus } from "@core/domain/challenges/challenge.entity"

export class ChallengeDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  description: string

  @ApiProperty({ enum: Difficulty })
  difficulty: Difficulty

  @ApiProperty()
  tags: string[]

  @ApiProperty()
  timeLimit: number

  @ApiProperty()
  memoryLimit: number

  @ApiProperty({ enum: ChallengeStatus })
  status: ChallengeStatus

  @ApiProperty()
  groupId: string

  @ApiProperty()
  createdBy: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
