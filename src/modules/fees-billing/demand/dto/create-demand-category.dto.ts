import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDemandCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
