import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class UpdateBusDto {
  @ValidateIf((dto) => dto.vehicle_number !== undefined)
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  vehicle_number?: string;

  @IsOptional()
  @IsInt()
  route_id?: number | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  driver_name?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  gps_device_id?: string | null;
}
