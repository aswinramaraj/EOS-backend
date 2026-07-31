import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTransportRouteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;
}
