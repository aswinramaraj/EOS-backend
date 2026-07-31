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
import { SalaryDivisionsService } from './salary-divisions.service';
import { CreateSalaryDivisionDto } from './dto/create-salary-division.dto';
import { UpdateSalaryDivisionDto } from './dto/update-salary-division.dto';
import { ListSalaryDivisionQueryDto } from './dto/list-salary-division-query.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalaryDivisionsController {
  constructor(
    private readonly salaryDivisionsService: SalaryDivisionsService,
  ) {}

  /** POST /api/v1/salary-divisions — HR Payroll only. */
  @Post('salary-divisions')
  @Roles(ROLES.HR_PAYROLL)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSalaryDivisionDto) {
    return this.salaryDivisionsService.create(dto);
  }

  /** GET /api/v1/salary-divisions — HR Payroll (all) / Faculty (own only). */
  @Get('salary-divisions')
  @Roles(ROLES.HR_PAYROLL, ROLES.FACULTY)
  findAll(
    @Query() query: ListSalaryDivisionQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salaryDivisionsService.findAll(query, user);
  }

  /** GET /api/v1/salary-divisions/:id — HR Payroll (all) / Faculty (own only). */
  @Get('salary-divisions/:id')
  @Roles(ROLES.HR_PAYROLL, ROLES.FACULTY)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.salaryDivisionsService.findOne(id, user);
  }

  /** PATCH /api/v1/salary-divisions/:id — HR Payroll only. */
  @Patch('salary-divisions/:id')
  @Roles(ROLES.HR_PAYROLL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSalaryDivisionDto,
  ) {
    return this.salaryDivisionsService.update(id, dto);
  }

  /** DELETE /api/v1/salary-divisions/:id — HR Payroll only. Hard delete (no soft-delete column). */
  @Delete('salary-divisions/:id')
  @Roles(ROLES.HR_PAYROLL)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.salaryDivisionsService.remove(id);
  }
}
