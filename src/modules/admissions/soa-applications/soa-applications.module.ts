import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SoaApplicationsService } from './soa-applications.service';
import { SoaApplicationsController } from './soa-applications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SoaApplicationsController],
  providers: [SoaApplicationsService],
})
export class SoaApplicationsModule {}
