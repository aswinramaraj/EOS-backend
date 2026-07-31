import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHostelRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
