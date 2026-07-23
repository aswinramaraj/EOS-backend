import { Module } from '@nestjs/common';
import { SoaApplicationsService } from './soa-applications.service';
import { SoaApplicationsController } from './soa-applications.controller';

@Module({
  controllers: [SoaApplicationsController],
  providers: [SoaApplicationsService],
})
export class SoaApplicationsModule {}
