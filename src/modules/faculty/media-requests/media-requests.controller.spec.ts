import { Test, TestingModule } from '@nestjs/testing';
import { MediaRequestsController } from './media-requests.controller';
import { MediaRequestsService } from './media-requests.service';

describe('MediaRequestsController', () => {
  let controller: MediaRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaRequestsController],
      providers: [MediaRequestsService],
    }).compile();

    controller = module.get<MediaRequestsController>(MediaRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
