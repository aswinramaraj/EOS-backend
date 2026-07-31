import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { StudentProfilesService } from './student-profiles.service';
import { StudentProfilesController } from './student-profiles.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StudentProfilesController],
  providers: [StudentProfilesService],
})
export class StudentProfilesModule {}
