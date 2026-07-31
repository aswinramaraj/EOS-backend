import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HolidaySlotsService } from './holiday-slots.service';
import { HolidaySlotsController } from './holiday-slots.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HolidaySlotsController],
  providers: [HolidaySlotsService],
})
export class HolidaySlotsModule {}
