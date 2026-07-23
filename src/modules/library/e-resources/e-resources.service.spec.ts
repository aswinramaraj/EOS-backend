import { Test, TestingModule } from '@nestjs/testing';
import { EResourcesService } from './e-resources.service';

describe('EResourcesService', () => {
  let service: EResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EResourcesService],
    }).compile();

    service = module.get<EResourcesService>(EResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
