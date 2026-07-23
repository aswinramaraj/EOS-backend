import { Module } from '@nestjs/common';
import { LmsNotesService } from './lms-notes.service';
import { LmsNotesController } from './lms-notes.controller';

@Module({
  controllers: [LmsNotesController],
  providers: [LmsNotesService],
})
export class LmsNotesModule {}
