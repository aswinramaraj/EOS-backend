import { PartialType } from '@nestjs/mapped-types';
import { CreateBorrowRecordDto } from './create-borrow-record.dto';

export class UpdateBorrowRecordDto extends PartialType(CreateBorrowRecordDto) {}