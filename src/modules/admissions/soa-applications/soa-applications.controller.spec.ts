import { Test, TestingModule } from '@nestjs/testing';
import { SoaApplicationsController } from './soa-applications.controller';
import { SoaApplicationsService } from './soa-applications.service';

describe('SoaApplicationsController', () => {
  let controller: SoaApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SoaApplicationsController],
      providers: [SoaApplicationsService],
    }).compile();

    controller = module.get<SoaApplicationsController>(SoaApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
