import { Test, TestingModule } from '@nestjs/testing';
import { HallPlansService } from './hall-plans.service';

describe('HallPlansService', () => {
  let service: HallPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HallPlansService],
    }).compile();

    service = module.get<HallPlansService>(HallPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
