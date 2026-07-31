import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FacultyMappingService } from './faculty-mapping.service';
import { FacultyMappingController } from './faculty-mapping.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FacultyMappingController],
  providers: [FacultyMappingService],
})
export class FacultyMappingModule {}
