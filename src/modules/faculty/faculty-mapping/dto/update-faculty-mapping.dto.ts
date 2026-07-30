import { PartialType } from '@nestjs/mapped-types';
import { CreateFacultyMappingDto } from './create-faculty-mapping.dto';

export class UpdateFacultyMappingDto extends PartialType(
  CreateFacultyMappingDto,
) {}
