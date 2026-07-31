import { IsNumber, Min } from 'class-validator';

/**
 * PATCH /me/exam-marks/:id (Faculty only — the faculty who entered it).
 * Corrects a wrongly-entered mark. Only marks_obtained is editable —
 * max_marks was fixed for the whole batch at entry time and isn't
 * reassignable per-row after the fact. The [0, max_marks] range is
 * re-checked against the row's own stored max_marks in the service.
 */
export class UpdateExamMarkDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  marks_obtained: number;
}
