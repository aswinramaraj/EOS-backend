import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DemandService } from './demand.service';
import { DemandController } from './demand.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DemandController],
  providers: [DemandService],
})
export class DemandModule {}
