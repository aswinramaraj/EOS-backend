import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class UpdateStudentHostelMappingDto {
  @ValidateIf((dto) => dto.student_id !== undefined)
  @IsInt()
  student_id?: number;

  @ValidateIf((dto) => dto.room_id !== undefined)
  @IsInt()
  room_id?: number;

  @IsOptional()
  @IsInt()
  fee_structure_id?: number | null;
}
