import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ServiceIndentsService } from './service-indents.service';
import { ServiceIndentsController } from './service-indents.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceIndentsController],
  providers: [ServiceIndentsService],
})
export class ServiceIndentsModule {}
