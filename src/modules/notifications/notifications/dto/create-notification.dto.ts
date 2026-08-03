import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateNotificationDto {
  @IsInt()
  @Min(1)
  user_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
