import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class JoinOdTeamDto {
  @IsString()
  @IsNotEmpty({ message: 'unique_code is required' })
  @MaxLength(20)
  unique_code: string;
}
