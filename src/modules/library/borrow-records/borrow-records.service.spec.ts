import { Test, TestingModule } from '@nestjs/testing';
import { BorrowRecordsService } from './borrow-records.service';

describe('BorrowRecordsService', () => {
  let service: BorrowRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowRecordsService],
    }).compile();

    service = module.get<BorrowRecordsService>(BorrowRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
