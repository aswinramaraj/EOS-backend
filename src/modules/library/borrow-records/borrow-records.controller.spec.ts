import { Test, TestingModule } from '@nestjs/testing';
import { BorrowRecordsController } from './borrow-records.controller';
import { BorrowRecordsService } from './borrow-records.service';

describe('BorrowRecordsController', () => {
  let controller: BorrowRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowRecordsController],
      providers: [BorrowRecordsService],
    }).compile();

    controller = module.get<BorrowRecordsController>(BorrowRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
