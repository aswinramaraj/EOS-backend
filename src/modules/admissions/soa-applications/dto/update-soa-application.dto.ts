import { PartialType } from '@nestjs/mapped-types';
import { CreateSoaApplicationDto } from './create-soa-application.dto';

export class UpdateSoaApplicationDto extends PartialType(
  CreateSoaApplicationDto,
) {}
