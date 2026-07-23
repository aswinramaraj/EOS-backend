import { Test, TestingModule } from '@nestjs/testing';
import { FeeStructureController } from './fee-structure.controller';
import { FeeStructureService } from './fee-structure.service';

describe('FeeStructureController', () => {
  let controller: FeeStructureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeeStructureController],
      providers: [FeeStructureService],
    }).compile();

    controller = module.get<FeeStructureController>(FeeStructureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
