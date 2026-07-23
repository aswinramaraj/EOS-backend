import { PartialType } from '@nestjs/mapped-types';
import { CreateRevaluationDto } from './create-revaluation.dto';

export class UpdateRevaluationDto extends PartialType(CreateRevaluationDto) {}
