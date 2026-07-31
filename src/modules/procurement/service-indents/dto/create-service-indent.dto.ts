import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateServiceIndentDto {
  @IsInt()
  requested_by_user_id: number;

  @IsInt()
  department_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  service_description: string;
}
