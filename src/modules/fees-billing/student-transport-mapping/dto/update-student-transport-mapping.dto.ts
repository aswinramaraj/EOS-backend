import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class UpdateStudentTransportMappingDto {
  @ValidateIf((dto) => dto.student_id !== undefined)
  @IsInt()
  student_id?: number;

  @ValidateIf((dto) => dto.route_id !== undefined)
  @IsInt()
  route_id?: number;

  @ValidateIf((dto) => dto.boarding_stage_id !== undefined)
  @IsInt()
  boarding_stage_id?: number;

  @ValidateIf((dto) => dto.destination_stage_id !== undefined)
  @IsInt()
  destination_stage_id?: number;

  @IsOptional()
  @IsInt()
  fee_structure_id?: number | null;
}
