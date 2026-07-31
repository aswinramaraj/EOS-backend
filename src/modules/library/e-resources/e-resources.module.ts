import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EResourcesService } from './e-resources.service';
import { EResourcesController } from './e-resources.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EResourcesController],
  providers: [EResourcesService],
})
export class EResourcesModule {}
