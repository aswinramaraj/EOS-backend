import { IsInt, IsNumber, Max, Min, ValidateIf } from 'class-validator';

export class UpdateBusLiveLocationDto {
  @ValidateIf((dto) => dto.bus_id !== undefined)
  @IsInt()
  bus_id?: number;

  @ValidateIf((dto) => dto.latitude !== undefined)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ValidateIf((dto) => dto.longitude !== undefined)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
