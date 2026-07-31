import { Module } from '@nestjs/common';
import { BorrowRecordsController } from './borrow-records.controller';
import { BorrowRecordsService } from './borrow-records.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BorrowRecordsController],
  providers: [BorrowRecordsService],
})
export class BorrowRecordsModule {}
