import { Module } from '@nestjs/common';
import { EResourcesService } from './e-resources.service';
import { EResourcesController } from './e-resources.controller';

@Module({
  controllers: [EResourcesController],
  providers: [EResourcesService],
})
export class EResourcesModule {}
