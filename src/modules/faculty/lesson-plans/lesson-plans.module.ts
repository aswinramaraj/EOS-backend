import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LessonPlansService } from './lesson-plans.service';
import { LessonPlansController } from './lesson-plans.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LessonPlansController],
  providers: [LessonPlansService],
})
export class LessonPlansModule {}
