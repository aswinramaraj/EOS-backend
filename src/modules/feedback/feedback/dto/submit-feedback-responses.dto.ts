import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FeedbackResponseItemDto {
  @IsInt()
  @IsPositive()
  question_id: number;

  /** Required for 'text' questions. Ignored for 'rating' questions. */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  response_text?: string;

  /** Required for 'rating' questions (1-5). Ignored for 'text' questions. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating_value?: number;
}

export class SubmitFeedbackResponsesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FeedbackResponseItemDto)
  responses: FeedbackResponseItemDto[];
}
