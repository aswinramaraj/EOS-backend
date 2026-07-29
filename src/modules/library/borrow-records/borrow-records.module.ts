import { Module } from '@nestjs/common';
import { BorrowRecordsController } from './borrow-records.controller';
import { MeBorrowedController } from './me-borrowed.controller';
import { BorrowRecordsService } from './borrow-records.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BorrowRecordsController, MeBorrowedController],
  providers: [BorrowRecordsService],
})
export class BorrowRecordsModule {}
