import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentLeafDto } from './create-student-leaf.dto';

export class UpdateStudentLeafDto extends PartialType(CreateStudentLeafDto) {}
