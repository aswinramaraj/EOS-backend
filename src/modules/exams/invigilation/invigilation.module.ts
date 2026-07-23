import { Module } from '@nestjs/common';
import { InvigilationService } from './invigilation.service';
import { InvigilationController } from './invigilation.controller';

@Module({
  controllers: [InvigilationController],
  providers: [InvigilationService],
})
export class InvigilationModule {}
