import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GrnService } from './grn.service';
import { GrnController } from './grn.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GrnController],
  providers: [GrnService],
})
export class GrnModule {}
