import { IsString, IsNumber, IsUUID, IsOptional, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGroupDto {
  @ApiProperty({ example: "uuid-del-curso" })
  @IsUUID()
  courseId: string;

  @ApiProperty({ example: 1, description: "Group number (1, 2, 3, etc.)" })
  @IsNumber()
  @Min(1)
  @Max(99)
  number: number;

  @ApiProperty({ example: "Grupo 01" })
  @IsString()
  name: string;

  @ApiProperty({ example: "Sección matutina", required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
