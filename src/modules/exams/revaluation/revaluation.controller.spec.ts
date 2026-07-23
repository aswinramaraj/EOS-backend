import { Test, TestingModule } from '@nestjs/testing';
import { RevaluationController } from './revaluation.controller';
import { RevaluationService } from './revaluation.service';

describe('RevaluationController', () => {
  let controller: RevaluationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevaluationController],
      providers: [RevaluationService],
    }).compile();

    controller = module.get<RevaluationController>(RevaluationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
