import { IsString, IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Language } from "@core/domain/submissions/submission.entity";

export class SubmitSolutionDto {
  @ApiProperty({ example: "uuid-del-reto" })
  @IsUUID()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ example: "uuid-del-grupo" })
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @ApiProperty({ example: "def solution(arr):\n    return sum(arr)" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: Language.PYTHON,
    description: "Language enum (PYTHON, JAVA, NODEJS, CPP) or human-friendly string (Python, C++, Node.js, Java)",
  })
  @IsNotEmpty()
  language: Language | string; // Accept both enum and friendly strings
}
