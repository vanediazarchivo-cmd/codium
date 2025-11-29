import { IsString, IsNumber, IsOptional, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateGroupDto {
  @ApiProperty({ example: "Grupo 01", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Sección matutina", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @Min(1)
  @Max(99)
  @IsOptional()
  number?: number;
}
