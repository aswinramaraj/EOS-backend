import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StudentTransportMappingService } from './student-transport-mapping.service';
import { StudentTransportMappingController } from './student-transport-mapping.controller';

@Module({
  imports: [PrismaModule],
  controllers: [StudentTransportMappingController],
  providers: [StudentTransportMappingService],
})
export class StudentTransportMappingModule {}
