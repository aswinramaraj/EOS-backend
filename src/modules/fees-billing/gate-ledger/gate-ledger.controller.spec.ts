import { Test, TestingModule } from '@nestjs/testing';
import { GateLedgerController } from './gate-ledger.controller';
import { GateLedgerService } from './gate-ledger.service';

describe('GateLedgerController', () => {
  let controller: GateLedgerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GateLedgerController],
      providers: [GateLedgerService],
    }).compile();

    controller = module.get<GateLedgerController>(GateLedgerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
