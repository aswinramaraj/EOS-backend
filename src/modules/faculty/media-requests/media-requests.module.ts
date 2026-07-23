import { Module } from '@nestjs/common';
import { MediaRequestsService } from './media-requests.service';
import { MediaRequestsController } from './media-requests.controller';

@Module({
  controllers: [MediaRequestsController],
  providers: [MediaRequestsService],
})
export class MediaRequestsModule {}
