import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HostelRoomService } from './hostel-room.service';
import { HostelRoomController } from './hostel-room.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HostelRoomController],
  providers: [HostelRoomService],
})
export class HostelRoomModule {}
