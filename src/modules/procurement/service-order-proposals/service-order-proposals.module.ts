import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceOrderProposalsService } from './service-order-proposals.service';
import { ServiceOrderProposalsController } from './service-order-proposals.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceOrderProposalsController],
  providers: [ServiceOrderProposalsService],
})
export class ServiceOrderProposalsModule {}
