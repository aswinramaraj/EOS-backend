import { IsInt, ValidateIf } from 'class-validator';

export class CreateStudentTransportMappingDto {
  @IsInt()
  student_id: number;

  @IsInt()
  route_id: number;

  @IsInt()
  boarding_stage_id: number;

  @IsInt()
  destination_stage_id: number;

  @ValidateIf((dto) => dto.fee_structure_id !== undefined)
  @IsInt()
  fee_structure_id?: number;
}
