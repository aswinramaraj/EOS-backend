import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MediaRequestsService } from './media-requests.service';
import { MediaRequestsController } from './media-requests.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MediaRequestsController],
  providers: [MediaRequestsService],
})
export class MediaRequestsModule {}
