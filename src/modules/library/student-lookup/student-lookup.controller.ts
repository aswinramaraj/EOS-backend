import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StudentLookupService } from './student-lookup.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FuzzySearchDto } from 'src/common';

/**
 * Staff-only student lookup for the library circulation desk (find a
 * student to issue/return a book against). Gated tighter than the
 * books/categories/e-resources /search endpoints since it surfaces
 * student PII (name, roll/register number, email) rather than catalogue data.
 */
@Controller('library/students')
export class StudentLookupController {
  constructor(private readonly studentLookupService: StudentLookupService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin')
  searchFuzzy(@Query() query: FuzzySearchDto) {
    return this.studentLookupService.searchFuzzy(query.q, query.limit);
  }

  // Roles include 'hod' too — this is meant to inform a HoD's manual
  // decision on a library_due hall-ticket-clearance request, not just the
  // circulation desk.
  @Get(':id/no-dues-check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('library', 'admin', 'hod')
  noDuesCheck(@Param('id', ParseIntPipe) id: number) {
    return this.studentLookupService.noDuesCheck(id);
  }
}
