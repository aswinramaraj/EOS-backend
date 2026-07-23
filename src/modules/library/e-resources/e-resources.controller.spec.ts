import { Test, TestingModule } from '@nestjs/testing';
import { EResourcesController } from './e-resources.controller';
import { EResourcesService } from './e-resources.service';

describe('EResourcesController', () => {
  let controller: EResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EResourcesController],
      providers: [EResourcesService],
    }).compile();

    controller = module.get<EResourcesController>(EResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
