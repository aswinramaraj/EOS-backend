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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { ROLES } from 'src/common/constants/roles.constant';
import { HolidaySlotsService } from './holiday-slots.service';
import { CreateHolidaySlotDto } from './dto/create-holiday-slot.dto';
import { UpdateHolidaySlotDto } from './dto/update-holiday-slot.dto';
import { ListHolidaySlotQueryDto } from './dto/list-holiday-slot-query.dto';
import { CreateHolidayMappingDto } from './dto/create-holiday-mapping.dto';
import { ListHolidayMappingQueryDto } from './dto/list-holiday-mapping-query.dto';

/**
 * No class-level @Controller() prefix — this controller serves three
 * top-level paths (holiday-slots/..., me/holiday-mapping/..., and
 * holiday-mapping/...), same trick as VenuesController/AnnouncementsController.
 */
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class HolidaySlotsController {
  constructor(private readonly holidaySlotsService: HolidaySlotsService) {}

  /** POST /api/v1/holiday-slots — HR Payroll only. */
  @Post('holiday-slots')
  @Roles(ROLES.HR_PAYROLL)
  @HttpCode(HttpStatus.CREATED)
  createSlot(@Body() dto: CreateHolidaySlotDto) {
    return this.holidaySlotsService.createSlot(dto);
  }

  /** GET /api/v1/holiday-slots — HR Payroll / Faculty (shared catalog). */
  @Get('holiday-slots')
  @Roles(ROLES.HR_PAYROLL, ROLES.FACULTY)
  findAllSlots(@Query() query: ListHolidaySlotQueryDto) {
    return this.holidaySlotsService.findAllSlots(query);
  }

  /** GET /api/v1/holiday-slots/:id — HR Payroll / Faculty. */
  @Get('holiday-slots/:id')
  @Roles(ROLES.HR_PAYROLL, ROLES.FACULTY)
  findOneSlot(@Param('id', ParseIntPipe) id: number) {
    return this.holidaySlotsService.findOneSlot(id);
  }

  /** PATCH /api/v1/holiday-slots/:id — HR Payroll only. */
  @Patch('holiday-slots/:id')
  @Roles(ROLES.HR_PAYROLL)
  updateSlot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHolidaySlotDto,
  ) {
    return this.holidaySlotsService.updateSlot(id, dto);
  }

  /** DELETE /api/v1/holiday-slots/:id — HR Payroll only. */
  @Delete('holiday-slots/:id')
  @Roles(ROLES.HR_PAYROLL)
  removeSlot(@Param('id', ParseIntPipe) id: number) {
    return this.holidaySlotsService.removeSlot(id);
  }

  /** POST /api/v1/me/holiday-mapping — Faculty only. Choose a slot. */
  @Post('me/holiday-mapping')
  @Roles(ROLES.FACULTY)
  @HttpCode(HttpStatus.CREATED)
  createMyMapping(
    @Body() dto: CreateHolidayMappingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.holidaySlotsService.createMapping(dto, user.sub);
  }

  /** GET /api/v1/me/holiday-mapping — Faculty only. Own selections. */
  @Get('me/holiday-mapping')
  @Roles(ROLES.FACULTY)
  findMyMappings(@CurrentUser() user: JwtPayload) {
    return this.holidaySlotsService.findMyMappings(user.sub);
  }

  /** DELETE /api/v1/me/holiday-mapping/:id — Faculty only. Own selection. */
  @Delete('me/holiday-mapping/:id')
  @Roles(ROLES.FACULTY)
  removeMyMapping(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.holidaySlotsService.removeMyMapping(id, user.sub);
  }

  /** GET /api/v1/holiday-mapping — HR Payroll only. Every faculty's selections. */
  @Get('holiday-mapping')
  @Roles(ROLES.HR_PAYROLL)
  findAllMappings(@Query() query: ListHolidayMappingQueryDto) {
    return this.holidaySlotsService.findAllMappings(query);
  }
}
