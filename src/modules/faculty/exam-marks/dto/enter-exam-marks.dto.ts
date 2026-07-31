import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

/** One student's mark within a POST /me/exams/:exam_subject_mapping_id/marks batch. */
export class ExamMarkEntryItemDto {
  @IsInt()
  student_id: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marks_obtained: number;
}

/**
 * POST /me/exams/:exam_subject_mapping_id/marks (Faculty only).
 * exam_subject_mapping_id is a path param, not a body field. The
 * [0, max_marks] range check is cross-field (depends on this DTO's own
 * max_marks), so it's enforced in the service, not here.
 */
export class EnterExamMarksDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  max_marks: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamMarkEntryItemDto)
  entries: ExamMarkEntryItemDto[];
}
