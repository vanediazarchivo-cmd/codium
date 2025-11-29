import { IsString, IsEnum, IsArray, IsNumber, IsUUID, Min, Max } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Difficulty } from "@core/domain/challenges/challenge.entity"

export class CreateChallengeDto {
  @ApiProperty({ example: "Two Sum" })
  @IsString()
  title: string

  @ApiProperty({ example: "Dado un arreglo de enteros..." })
  @IsString()
  description: string

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  @IsEnum(Difficulty)
  difficulty: Difficulty

  @ApiProperty({ example: ["arrays", "hashmap"] })
  @IsArray()
  @IsString({ each: true })
  tags: string[]

  @ApiProperty({ example: 1500, description: "Time limit in milliseconds" })
  @IsNumber()
  @Min(100)
  @Max(10000)
  timeLimit: number

  @ApiProperty({ example: 256, description: "Memory limit in MB" })
  @IsNumber()
  @Min(64)
  @Max(1024)
  memoryLimit: number

  @ApiProperty({ example: "uuid", description: "ID del grupo" })
  @IsUUID()
  groupId: string
}
