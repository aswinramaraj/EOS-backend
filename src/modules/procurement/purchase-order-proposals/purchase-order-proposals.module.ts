import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PurchaseOrderProposalsService } from './purchase-order-proposals.service';
import { PurchaseOrderProposalsController } from './purchase-order-proposals.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PurchaseOrderProposalsController],
  providers: [PurchaseOrderProposalsService],
})
export class PurchaseOrderProposalsModule {}
