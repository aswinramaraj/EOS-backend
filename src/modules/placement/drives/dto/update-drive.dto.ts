import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { CreateDriveDto } from './create-drive.dto';
import { DRIVE_STATUSES, type DriveStatus } from './drive-status.constant';

export class UpdateDriveDto extends PartialType(CreateDriveDto) {
  @IsOptional()
  @IsIn(DRIVE_STATUSES)
  status?: DriveStatus;
}
