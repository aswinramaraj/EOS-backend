import { Module } from '@nestjs/common';
import { FacultyMappingService } from './faculty-mapping.service';
import { FacultyMappingController } from './faculty-mapping.controller';

@Module({
  controllers: [FacultyMappingController],
  providers: [FacultyMappingService],
})
export class FacultyMappingModule {}
