import { PartialType } from '@nestjs/mapped-types';
import { CreateEResourceDto } from './create-e-resource.dto';

export class UpdateEResourceDto extends PartialType(CreateEResourceDto) {}
