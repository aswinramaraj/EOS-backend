import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { bonafide_status_enum } from 'generated/prisma/client';

const VALID_STATUSES = Object.values(bonafide_status_enum);

export class GetBonafideRequestsDto {
  @IsOptional()
  @IsIn(VALID_STATUSES, {
    message: `status must be a valid bonafide status value (${VALID_STATUSES.join(', ')})`,
  })
  status?: bonafide_status_enum;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number = 20;
}
