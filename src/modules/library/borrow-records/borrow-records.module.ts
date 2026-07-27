import { Module } from '@nestjs/common';
import { BorrowRecordsController } from './borrow-records.controller';
import { BorrowRecordsService } from './borrow-records.service';

@Module({
  controllers: [BorrowRecordsController],
  providers: [BorrowRecordsService],
})
export class BorrowRecordsModule {}