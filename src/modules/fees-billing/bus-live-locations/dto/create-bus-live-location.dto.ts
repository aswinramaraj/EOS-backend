import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateBusLiveLocationDto {
  @IsInt()
  bus_id: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}
