import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MeController } from './me-profile.controller';
import { MeProfileService } from './me-profile.service';
import { MeAttendanceService } from './me-attendance.service';
import { MeLeavesService } from './me-leaves.service';

@Module({
  imports: [PrismaModule],
  controllers: [MeController],
  providers: [MeProfileService, MeAttendanceService, MeLeavesService],
})
export class MeProfileModule {}
