import { PartialType } from '@nestjs/mapped-types';
import { CreateOdDto } from './create-od.dto';

export class UpdateOdDto extends PartialType(CreateOdDto) {}
