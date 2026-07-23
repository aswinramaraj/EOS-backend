import { Test, TestingModule } from '@nestjs/testing';
import { MediaRequestsService } from './media-requests.service';

describe('MediaRequestsService', () => {
  let service: MediaRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaRequestsService],
    }).compile();

    service = module.get<MediaRequestsService>(MediaRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
