import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export enum AcademicCalendarEventType {
  HOLIDAY = 'holiday',
  EVENT = 'event',
}

export class CreateAcademicCalendarEventDto {
  @IsInt()
  academic_calendar_id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsDateString()
  event_date!: string;

  @IsEnum(AcademicCalendarEventType)
  event_type!: AcademicCalendarEventType;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'start_time must be in HH:mm or HH:mm:ss format',
  })
  start_time!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'end_time must be in HH:mm or HH:mm:ss format',
  })
  end_time!: string;
}
