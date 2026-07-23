import { PartialType } from '@nestjs/mapped-types';
import { CreateBonafideDto } from './create-bonafide.dto';

export class UpdateBonafideDto extends PartialType(CreateBonafideDto) {}
