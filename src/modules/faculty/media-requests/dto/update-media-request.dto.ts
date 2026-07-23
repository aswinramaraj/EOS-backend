import { PartialType } from '@nestjs/mapped-types';
import { CreateMediaRequestDto } from './create-media-request.dto';

export class UpdateMediaRequestDto extends PartialType(CreateMediaRequestDto) {}
