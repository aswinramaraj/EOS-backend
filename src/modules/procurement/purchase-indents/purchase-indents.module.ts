import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PurchaseIndentsService } from './purchase-indents.service';
import { PurchaseIndentsController } from './purchase-indents.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PurchaseIndentsController],
  providers: [PurchaseIndentsService],
})
export class PurchaseIndentsModule {}
