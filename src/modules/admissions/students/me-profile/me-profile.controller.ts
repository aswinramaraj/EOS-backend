import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetAttendanceDto } from './dto/get-attendance.dto';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { GetLeavesDto } from './dto/get-leaves.dto';
import { CreateOdTeamDto } from './dto/create-od-team.dto';
import { JoinOdTeamDto } from './dto/join-od-team.dto';
import { MeProfileService } from './me-profile.service';
import { MeAttendanceService } from './me-attendance.service';
import { MeLeavesService } from './me-leaves.service';
import { MeLeavesListService } from './me-leaves-list.service';
import { MeOdTeamsService } from './me-od-teams.service';

@Controller('me')
export class MeController {
  constructor(
    private readonly meProfileService: MeProfileService,
    private readonly meAttendanceService: MeAttendanceService,
    private readonly meLeavesService: MeLeavesService,
    private readonly meLeavesListService: MeLeavesListService,
    private readonly meOdTeamsService: MeOdTeamsService,
  ) {}

  /**
   * PUT /api/v1/me/profile
   *
   * Self-scoped: student_id is always resolved from the JWT, never accepted
   * from the request. Partial-update semantics despite the PUT verb (see
   * todo.md/PUT-me-profile.md "Known Limitations" — PATCH would be more
   * accurate, kept as PUT to match the agreed contract).
   *
   * Error responses:
   *  400 VALIDATION_ERROR      – malformed field (bad email/mobile format, etc.)
   *  401 UNAUTHORIZED          – missing/invalid JWT
   *  403 FORBIDDEN             – authenticated but not a student
   *  404 STUDENT_NOT_FOUND     – authenticated user has no linked student record
   *  422 INVALID_ADDRESS_TYPE  – addresses[].address_type isn't a real enum value
   *  500 INTERNAL_ERROR        – unexpected server failure
   */
  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.meProfileService.updateMyProfile(user.sub, dto);
  }

  /**
   * GET /api/v1/me/profile
   *
   * Self-scoped: student_id is always resolved from the JWT. Returns the
   * core student record joined to courses/quotas/classes/batches display
   * names plus addresses/identity_marks/family_details/contacts.
   * `student_sensitive_info` (Aadhar/PAN) is intentionally never returned —
   * see todo.md/5-GET-me-profile.md's own note about a future, separately
   * scoped sensitive-info endpoint.
   *
   * Error responses:
   *  401 UNAUTHORIZED       – missing/invalid JWT
   *  403 FORBIDDEN          – authenticated but not a student
   *  404 STUDENT_NOT_FOUND  – authenticated user has no linked student record
   *  500 INTERNAL_ERROR     – unexpected server failure
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.meProfileService.getMyProfile(user.sub);
  }

  /**
   * GET /api/v1/me/attendance?from=&to=&subject_id=
   *
   * Self-scoped: student_id resolved from the JWT. Aggregates
   * `attendance_records` in [from, to] into an overall summary, a
   * per-subject breakdown, and the raw day-by-day list.
   *
   * Error responses:
   *  400 VALIDATION_ERROR   – missing/malformed from/to, or from > to
   *  401 UNAUTHORIZED       – missing/invalid JWT
   *  403 FORBIDDEN          – authenticated but not a student
   *  404 STUDENT_NOT_FOUND  – authenticated user has no linked student record
   *  404 SUBJECT_NOT_FOUND  – subject_id doesn't reference an existing subject
   *  500 INTERNAL_ERROR     – unexpected server failure
   */
  @Get('attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  getAttendance(
    @CurrentUser() user: JwtPayload,
    @Query() dto: GetAttendanceDto,
  ) {
    return this.meAttendanceService.getMyAttendance(user.sub, dto);
  }

  /**
   * POST /api/v1/me/leaves
   *
   * Self-scoped: student_id resolved from the JWT. Always starts the
   * two-stage approval chain at status='pending', both approval columns
   * null. Does not check for an assigned mentor or overlapping requests —
   * both explicitly out of scope per todo.md/7-POST-me-leaves.md.
   *
   * Error responses:
   *  400 VALIDATION_ERROR    – missing/malformed from_date/to_date
   *  401 UNAUTHORIZED        – missing/invalid JWT
   *  403 FORBIDDEN           – authenticated but not a student
   *  404 STUDENT_NOT_FOUND   – authenticated user has no linked student record
   *  422 INVALID_DATE_RANGE  – from_date in the past, or from_date > to_date
   *  500 INTERNAL_ERROR      – unexpected server failure
   */
  @Post('leaves')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  createLeave(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeaveDto) {
    return this.meLeavesService.createLeave(user.sub, dto);
  }

  /**
   * GET /api/v1/me/leaves?status=&page=&page_size=
   *
   * Self-scoped: student_id resolved from the JWT. Lists the caller's own
   * leave requests, most-recent-first, with resolved approver display
   * strings for the mentor-faculty and HoD stages.
   *
   * Error responses:
   *  400 VALIDATION_ERROR   – status isn't a real enum value
   *  401 UNAUTHORIZED       – missing/invalid JWT
   *  403 FORBIDDEN          – authenticated but not a student
   *  404 STUDENT_NOT_FOUND  – authenticated user has no linked student record
   *  500 INTERNAL_ERROR     – unexpected server failure
   */
  @Get('leaves')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  getLeaves(@CurrentUser() user: JwtPayload, @Query() dto: GetLeavesDto) {
    return this.meLeavesListService.getMyLeaves(user.sub, dto);
  }

  /**
   * POST /api/v1/me/od-teams
   *
   * Self-scoped: created_by_student_id resolved from the JWT. Auto-joins
   * the creator as the team's first od_team_members row (see
   * MeOdTeamsService for the rationale) and generates a collision-checked
   * unique_code server-side. Request body is empty per
   * todo.md/9-POST-me-od-teams.md — CreateOdTeamDto has no properties so
   * the global whitelist rejects any attempt to inject
   * created_by_student_id/unique_code/is_locked.
   *
   * Error responses:
   *  401 UNAUTHORIZED       – missing/invalid JWT
   *  403 FORBIDDEN          – authenticated but not a student
   *  404 STUDENT_NOT_FOUND  – authenticated user has no linked student record
   *  500 INTERNAL_ERROR     – unexpected server failure
   */
  @Post('od-teams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  createOdTeam(
    @CurrentUser() user: JwtPayload,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- CreateOdTeamDto has no properties; binding it here is what makes the global whitelist/forbidNonWhitelisted pipe reject any smuggled created_by_student_id/unique_code/is_locked in the body
    @Body() dto: CreateOdTeamDto,
  ) {
    return this.meOdTeamsService.createOdTeam(user.sub);
  }

  /**
   * POST /api/v1/me/od-teams/join
   *
   * Self-scoped: student_id resolved from the JWT. Resolves the target team
   * from the client-supplied unique_code — the only field the client
   * controls. See MeOdTeamsService.joinOdTeam() for the already-member race
   * handling and the response-enrichment rationale.
   *
   * Error responses:
   *  400 VALIDATION_ERROR   – unique_code missing/empty
   *  401 UNAUTHORIZED       – missing/invalid JWT
   *  403 FORBIDDEN          – authenticated but not a student
   *  404 STUDENT_NOT_FOUND  – authenticated user has no linked student record
   *  404 TEAM_NOT_FOUND     – unique_code doesn't match any team
   *  409 ALREADY_A_MEMBER   – student already belongs to this team
   *  422 TEAM_LOCKED        – team is no longer accepting new members
   *  500 INTERNAL_ERROR     – unexpected server failure
   */
  @Post('od-teams/join')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLES.STUDENT)
  joinOdTeam(@CurrentUser() user: JwtPayload, @Body() dto: JoinOdTeamDto) {
    return this.meOdTeamsService.joinOdTeam(user.sub, dto);
  }
}
