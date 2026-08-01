import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BusLiveLocationsService } from './bus-live-locations.service';
import { BusLiveLocationsController } from './bus-live-locations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BusLiveLocationsController],
  providers: [BusLiveLocationsService],
})
export class BusLiveLocationsModule {}
