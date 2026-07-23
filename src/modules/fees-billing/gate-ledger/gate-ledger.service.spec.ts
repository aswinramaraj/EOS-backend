import { Test, TestingModule } from '@nestjs/testing';
import { GateLedgerService } from './gate-ledger.service';

describe('GateLedgerService', () => {
  let service: GateLedgerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GateLedgerService],
    }).compile();

    service = module.get<GateLedgerService>(GateLedgerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
