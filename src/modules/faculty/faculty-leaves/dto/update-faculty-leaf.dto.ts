import { PartialType } from '@nestjs/mapped-types';
import { CreateFacultyLeafDto } from './create-faculty-leaf.dto';

export class UpdateFacultyLeafDto extends PartialType(CreateFacultyLeafDto) {}
