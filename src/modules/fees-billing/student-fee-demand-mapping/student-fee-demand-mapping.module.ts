import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentFeeDemandMappingService } from './student-fee-demand-mapping.service';
import { StudentFeeDemandMappingController } from './student-fee-demand-mapping.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StudentFeeDemandMappingController],
  providers: [StudentFeeDemandMappingService],
})
export class StudentFeeDemandMappingModule {}
