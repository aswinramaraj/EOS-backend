import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VendorsController],
  providers: [VendorsService],
})
export class VendorsModule {}
