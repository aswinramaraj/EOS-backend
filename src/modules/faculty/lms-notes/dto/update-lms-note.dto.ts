import { PartialType } from '@nestjs/mapped-types';
import { CreateLmsNoteDto } from './create-lms-note.dto';

export class UpdateLmsNoteDto extends PartialType(CreateLmsNoteDto) {}
