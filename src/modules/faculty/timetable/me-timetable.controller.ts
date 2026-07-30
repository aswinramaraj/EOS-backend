import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { TimetableService } from './timetable.service';
import { GetMyTimetableQueryDto } from './dto/get-my-timetable-query.dto';

/**
 * GET /api/v1/me/timetable — Student only.
 *
 * A separate controller (not TimetableController) because the required
 * path is /me/timetable, not /timetable — Nest always prepends a
 * controller's own @Controller() prefix to every route. Registered in this
 * same TimetableModule; delegates to the existing TimetableService; no
 * existing route touched.
 */
@Controller('me/timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeTimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get()
  @Roles(ROLES.STUDENT)
  getMyTimetable(
    @Query() query: GetMyTimetableQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.timetableService.findForStudent(user.sub, query);
  }
}
