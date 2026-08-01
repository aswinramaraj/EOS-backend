import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateBusDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  vehicle_number: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  bus_no: string;

  @ValidateIf((dto) => dto.route_id !== undefined)
  @IsInt()
  route_id?: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  driver_name?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  gps_device_id?: string;
}
