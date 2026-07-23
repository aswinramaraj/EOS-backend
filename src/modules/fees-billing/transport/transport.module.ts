import { Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportGateway } from './transport.gateway';

@Module({
  providers: [TransportGateway, TransportService],
})
export class TransportModule {}
