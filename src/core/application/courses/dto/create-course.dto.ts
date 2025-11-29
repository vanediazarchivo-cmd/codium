import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
  // `code` funciona como NRC identificador del curso. No manejar `period/semester` aquí.

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  professorId: string;
}