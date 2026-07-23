import { Module } from '@nestjs/common';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfilesController } from './student-profiles.controller';

@Module({
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService],
})
export class StudentProfilesModule {}
