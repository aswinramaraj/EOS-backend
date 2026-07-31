import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFeedbackQuestionDto } from './create-feedback-question.dto';

export class CreateFeedbackFormDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  /** Target a single class. Leave unset to target an entire batch or the whole institute. */
  @IsOptional()
  @IsInt()
  @IsPositive()
  class_id?: number;

  /** Target every class in a batch. Ignored if class_id is set. */
  @IsOptional()
  @IsInt()
  @IsPositive()
  batch_id?: number;

  @IsArray()
  @ArrayMinSize(1, {
    message: 'A feedback form must have at least one question',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateFeedbackQuestionDto)
  questions: CreateFeedbackQuestionDto[];
}
