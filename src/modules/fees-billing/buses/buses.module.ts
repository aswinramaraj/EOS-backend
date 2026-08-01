import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BusesService } from './buses.service';
import { BusesController } from './buses.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BusesController],
  providers: [BusesService],
})
export class BusesModule {}
