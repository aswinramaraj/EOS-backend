import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FacultyController],
  providers: [FacultyService],
})
export class FacultyModule {}
