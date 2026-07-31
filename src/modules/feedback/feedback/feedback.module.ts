import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { StudentFeedbackController } from './student-feedback.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FeedbackController, StudentFeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
