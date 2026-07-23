import { Module } from '@nestjs/common';
import { OdService } from './od.service';
import { OdController } from './od.controller';

@Module({
  controllers: [OdController],
  providers: [OdService],
})
export class OdModule {}
