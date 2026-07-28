import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { feedback_question_type_enum } from '../../../../../generated/prisma/enums';

export class UpdateFeedbackQuestionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question_text?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sequence_no?: number;

  @IsOptional()
  @IsEnum(feedback_question_type_enum)
  question_type?: feedback_question_type_enum;
}
