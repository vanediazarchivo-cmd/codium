import { ApiProperty } from "@nestjs/swagger";
import { GroupDto } from "../../groups/dto/group.dto";

export class CourseDto {
  @ApiProperty({ example: "uuid" })
  id: string;

  @ApiProperty({ example: "Introducción a Algoritmos" })
  name: string;

  @ApiProperty({ example: "NRC-1234", description: "Course code / NRC" })
  code: string;

  @ApiProperty({ example: ["uuid-prof-1"] })
  professorIds: string[];

  @ApiProperty({ required: false, type: [GroupDto] })
  groups?: GroupDto[];
}