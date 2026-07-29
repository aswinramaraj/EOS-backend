import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BorrowRecordsService } from './borrow-records.service';
import { GetMyBorrowedDto } from './dto/get-my-borrowed.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('me/library/borrowed')
export class MeBorrowedController {
  constructor(private readonly borrowRecordsService: BorrowRecordsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @Get()
  findMyBorrowed(
    @Query() query: GetMyBorrowedDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.borrowRecordsService.findMyBorrowed(query, user);
  }
}
