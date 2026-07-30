import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { TimetableService } from './timetable.service';

/**
 * GET /api/v1/me/classes/today — Faculty only.
 *
 * A separate controller (not TimetableController) because the required path
 * is /me/classes/today, not nested under /timetable — Nest always prepends
 * a controller's own @Controller() prefix to every one of its routes, so a
 * distinct top-level path needs its own controller class. It's registered in
 * this same TimetableModule and delegates to the existing TimetableService;
 * no new module was created and no existing timetable route was touched.
 */
@Controller('me/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeClassesController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get('today')
  @Roles(ROLES.FACULTY)
  findToday(@CurrentUser() user: JwtPayload) {
    return this.timetableService.findTodayForFaculty(user.sub);
  }
}
