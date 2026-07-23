import { Test, TestingModule } from '@nestjs/testing';
import { BonafideService } from './bonafide.service';

describe('BonafideService', () => {
  let service: BonafideService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BonafideService],
    }).compile();

    service = module.get<BonafideService>(BonafideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
