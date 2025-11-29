import { ApiProperty } from "@nestjs/swagger";

export class GroupDto {
  @ApiProperty({ example: "uuid" })
  id: string;

  @ApiProperty({ example: "uuid" })
  courseId: string;

  @ApiProperty({ example: 1, description: "Group number (1, 2, 3, etc.)" })
  number: number;

  @ApiProperty({ example: "Grupo 01" })
  name: string;

  @ApiProperty({ example: "Sección matutina", required: false })
  description?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
