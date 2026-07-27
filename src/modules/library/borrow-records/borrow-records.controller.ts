import { Controller } from '@nestjs/common';
import { BorrowRecordsService } from './borrow-records.service';

@Controller('borrow-records')
export class BorrowRecordsController {
  constructor(
    private readonly borrowRecordsService: BorrowRecordsService,
  ) {}
}