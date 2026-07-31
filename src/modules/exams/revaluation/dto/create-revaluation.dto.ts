// dto/create-revaluation.dto.ts
import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRevaluationDto {
  @Type(() => Number)
  @IsInt({ message: 'exam_marks_id must be an integer' })
  @IsPositive({ message: 'exam_marks_id must be a positive integer' })
  exam_marks_id!: number;

  @Type(() => Number)
  @IsInt({ message: 'student_id must be an integer' })
  @IsPositive({ message: 'student_id must be a positive integer' })
  student_id!: number;
}
