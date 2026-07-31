import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HostelRoomTypeService } from './hostel-room-type.service';
import { HostelRoomTypeController } from './hostel-room-type.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HostelRoomTypeController],
  providers: [HostelRoomTypeService],
})
export class HostelRoomTypeModule {}
