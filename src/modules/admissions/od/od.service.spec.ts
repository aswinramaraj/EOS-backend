import { Test, TestingModule } from '@nestjs/testing';
import { OdService } from './od.service';

describe('OdService', () => {
  let service: OdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OdService],
    }).compile();

    service = module.get<OdService>(OdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
