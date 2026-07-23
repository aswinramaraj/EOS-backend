import { Module } from '@nestjs/common';
import { GateLedgerService } from './gate-ledger.service';
import { GateLedgerController } from './gate-ledger.controller';

@Module({
  controllers: [GateLedgerController],
  providers: [GateLedgerService],
})
export class GateLedgerModule {}
