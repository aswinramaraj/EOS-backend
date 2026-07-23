import { Test, TestingModule } from '@nestjs/testing';
import { OdController } from './od.controller';
import { OdService } from './od.service';

describe('OdController', () => {
  let controller: OdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OdController],
      providers: [OdService],
    }).compile();

    controller = module.get<OdController>(OdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
