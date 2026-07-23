import { PartialType } from '@nestjs/mapped-types';
import { CreateGateLedgerDto } from './create-gate-ledger.dto';

export class UpdateGateLedgerDto extends PartialType(CreateGateLedgerDto) {}
