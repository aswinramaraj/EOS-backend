import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LmsNotesService } from './lms-notes.service';
import { LmsNotesController } from './lms-notes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LmsNotesController],
  providers: [LmsNotesService],
})
export class LmsNotesModule {}
