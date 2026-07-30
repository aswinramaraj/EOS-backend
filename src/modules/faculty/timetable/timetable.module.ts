import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { MeTimetableController } from './me-timetable.controller';
import { MeClassesController } from './me-classes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    TimetableController,
    MeTimetableController,
    MeClassesController,
  ],
  providers: [TimetableService],
})
export class TimetableModule {}
