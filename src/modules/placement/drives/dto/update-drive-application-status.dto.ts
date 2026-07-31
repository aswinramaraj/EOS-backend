import { IsEnum } from 'class-validator';
import { drive_application_status_enum } from '../../../../../generated/prisma/enums';

export class UpdateDriveApplicationStatusDto {
  @IsEnum(drive_application_status_enum)
  status: drive_application_status_enum;
}
