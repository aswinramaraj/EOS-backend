import { IsInt, IsPositive } from 'class-validator';

export class CreateDriveApplicationDto {
  @IsInt()
  @IsPositive()
  student_id: number;
}
