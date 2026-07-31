import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FeeConcessionService } from './fee-concession.service';
import { FeeConcessionController } from './fee-concession.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FeeConcessionController],
  providers: [FeeConcessionService],
})
export class FeeConcessionModule {}
