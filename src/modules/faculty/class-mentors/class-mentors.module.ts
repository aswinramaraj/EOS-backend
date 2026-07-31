import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ClassMentorsService } from './class-mentors.service';
import { ClassMentorsController } from './class-mentors.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClassMentorsController],
  providers: [ClassMentorsService],
})
export class ClassMentorsModule {}
