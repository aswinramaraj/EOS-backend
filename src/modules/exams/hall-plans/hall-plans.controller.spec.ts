import { Test, TestingModule } from '@nestjs/testing';
import { HallPlansController } from './hall-plans.controller';
import { HallPlansService } from './hall-plans.service';

describe('HallPlansController', () => {
  let controller: HallPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HallPlansController],
      providers: [HallPlansService],
    }).compile();

    controller = module.get<HallPlansController>(HallPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
