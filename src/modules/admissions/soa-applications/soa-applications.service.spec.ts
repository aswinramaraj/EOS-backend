import { Test, TestingModule } from '@nestjs/testing';
import { SoaApplicationsService } from './soa-applications.service';

describe('SoaApplicationsService', () => {
  let service: SoaApplicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoaApplicationsService],
    }).compile();

    service = module.get<SoaApplicationsService>(SoaApplicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
