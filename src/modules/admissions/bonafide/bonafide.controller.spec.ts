import { Test, TestingModule } from '@nestjs/testing';
import { BonafideController } from './bonafide.controller';
import { BonafideService } from './bonafide.service';

describe('BonafideController', () => {
  let controller: BonafideController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BonafideController],
      providers: [BonafideService],
    }).compile();

    controller = module.get<BonafideController>(BonafideController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
