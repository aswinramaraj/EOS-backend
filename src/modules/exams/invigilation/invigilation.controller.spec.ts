import { Test, TestingModule } from '@nestjs/testing';
import { InvigilationController } from './invigilation.controller';
import { InvigilationService } from './invigilation.service';

describe('InvigilationController', () => {
  let controller: InvigilationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvigilationController],
      providers: [InvigilationService],
    }).compile();

    controller = module.get<InvigilationController>(InvigilationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
