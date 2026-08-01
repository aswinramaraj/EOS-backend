import { IsInt, ValidateIf } from 'class-validator';

export class CreateStudentHostelMappingDto {
  @IsInt()
  student_id: number;

  @IsInt()
  room_id: number;

  @ValidateIf((dto) => dto.fee_structure_id !== undefined)
  @IsInt()
  fee_structure_id?: number;
}
