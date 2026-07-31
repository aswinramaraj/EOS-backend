import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MeClassesAttendanceController } from './me-classes-attendance.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController, MeClassesAttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
