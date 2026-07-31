import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VendorQuotationsService } from './vendor-quotations.service';
import { VendorQuotationsController } from './vendor-quotations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VendorQuotationsController],
  providers: [VendorQuotationsService],
})
export class VendorQuotationsModule {}
