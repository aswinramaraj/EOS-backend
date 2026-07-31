import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FeePaymentService } from './fee-payment.service';
import { FeePaymentController } from './fee-payment.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FeePaymentController],
  providers: [FeePaymentService],
})
export class FeePaymentModule {}
