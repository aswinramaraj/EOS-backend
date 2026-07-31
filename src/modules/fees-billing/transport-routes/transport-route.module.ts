import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TransportRouteService } from './transport-route.service';
import { TransportRouteController } from './transport-route.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TransportRouteController],
  providers: [TransportRouteService],
})
export class TransportRouteModule {}
