import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MeController } from './me-profile.controller';
import { MeProfileService } from './me-profile.service';
import { MeAttendanceService } from './me-attendance.service';
import { MeLeavesService } from './me-leaves.service';
import { MeLeavesListService } from './me-leaves-list.service';
import { MeOdTeamsService } from './me-od-teams.service';
import { MeOdRequestsService } from './me-od-requests.service';
import { MeHostelOutingsService } from './me-hostel-outings.service';
import { MeBonafideRequestsService } from './me-bonafide-requests.service';
import { MeProjectsService } from './me-projects.service';

@Module({
  imports: [PrismaModule],
  controllers: [MeController],
  providers: [
    MeProfileService,
    MeAttendanceService,
    MeLeavesService,
    MeLeavesListService,
    MeOdTeamsService,
    MeOdRequestsService,
    MeHostelOutingsService,
    MeBonafideRequestsService,
    MeProjectsService,
  ],
})
export class MeProfileModule {}
