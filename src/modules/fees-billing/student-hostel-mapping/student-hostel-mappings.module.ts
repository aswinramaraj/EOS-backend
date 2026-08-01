import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentHostelMappingsService } from './student-hostel-mappings.service';
import { StudentHostelMappingsController } from './student-hostel-mappings.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StudentHostelMappingsController],
  providers: [StudentHostelMappingsService],
})
export class StudentHostelMappingsModule {}
