import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { LessonPlansService } from './lesson-plans.service';
import { CreateLessonPlanDto } from './dto/create-lesson-plan.dto';
import { UpdateLessonPlanDto } from './dto/update-lesson-plan.dto';
import { ListLessonPlanQueryDto } from './dto/list-lesson-plan-query.dto';
import { UpsertLessonPlanDto } from './dto/upsert-lesson-plan.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonPlansController {
  constructor(private readonly lessonPlansService: LessonPlansService) {}

  /** POST /api/v1/lesson-plans — Faculty only. */
  @Post('lesson-plans')
  @Roles(ROLES.FACULTY)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLessonPlanDto, @CurrentUser() user: JwtPayload) {
    return this.lessonPlansService.create(dto, user.sub);
  }

  /** PUT /api/v1/me/lesson-plans — Faculty only. Upsert on (faculty_id, subject_id, class_id, semester). */
  @Put('lesson-plans')
  @Roles(ROLES.FACULTY)
  upsert(@Body() dto: UpsertLessonPlanDto, @CurrentUser() user: JwtPayload) {
    return this.lessonPlansService.upsertForFaculty(dto, user.sub);
  }

  /** GET /api/v1/lesson-plans — Faculty/HoD/Student. Paginated, filterable. */
  @Get('lesson-plans')
  @Roles(ROLES.FACULTY, ROLES.HOD, ROLES.STUDENT)
  findAll(@Query() query: ListLessonPlanQueryDto) {
    return this.lessonPlansService.findAll(query);
  }

  /** GET /api/v1/lesson-plans/:id — Faculty/HoD/Student. */
  @Get('lesson-plans/:id')
  @Roles(ROLES.FACULTY, ROLES.HOD, ROLES.STUDENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.lessonPlansService.findOne(id);
  }

  /** PATCH /api/v1/lesson-plans/:id — Faculty only, and only the faculty who owns it. */
  @Patch('lesson-plans/:id')
  @Roles(ROLES.FACULTY)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonPlanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonPlansService.update(id, dto, user.sub);
  }

  /** DELETE /api/v1/lesson-plans/:id — Faculty only, and only the faculty who owns it. */
  @Delete('lesson-plans/:id')
  @Roles(ROLES.FACULTY)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.lessonPlansService.remove(id, user.sub);
  }
}
