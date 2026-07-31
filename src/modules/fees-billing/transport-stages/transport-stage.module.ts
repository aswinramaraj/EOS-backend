import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransportStageService } from './transport-stage.service';
import { TransportStageController } from './transport-stage.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TransportStageController],
  providers: [TransportStageService],
})
export class TransportStageModule {}
