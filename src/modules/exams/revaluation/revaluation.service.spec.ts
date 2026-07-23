import { Test, TestingModule } from '@nestjs/testing';
import { RevaluationService } from './revaluation.service';

describe('RevaluationService', () => {
  let service: RevaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevaluationService],
    }).compile();

    service = module.get<RevaluationService>(RevaluationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
