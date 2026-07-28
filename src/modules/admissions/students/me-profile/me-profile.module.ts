import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MeController } from './me-profile.controller';
import { MeProfileService } from './me-profile.service';
import { MeAttendanceService } from './me-attendance.service';

@Module({
  imports: [PrismaModule],
  controllers: [MeController],
  providers: [MeProfileService, MeAttendanceService],
})
export class MeProfileModule {}
