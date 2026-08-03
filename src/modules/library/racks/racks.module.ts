import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RacksController } from './racks.controller';
import { RacksService } from './racks.service';

@Module({
  imports: [PrismaModule],
  controllers: [RacksController],
  providers: [RacksService],
})
export class RacksModule {}
