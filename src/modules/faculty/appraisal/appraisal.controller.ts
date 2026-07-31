import {
<<<<<<< HEAD
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
=======
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
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
import { AppraisalService } from './appraisal.service';
import { CreateAppraisalDto } from './dto/create-appraisal.dto';
import { UpdateAppraisalDto } from './dto/update-appraisal.dto';
import { ListAppraisalQueryDto } from './dto/list-appraisal-query.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppraisalController {
  constructor(private readonly appraisalService: AppraisalService) {}

  /** POST /api/v1/appraisal — Faculty only, for the caller's own record. */
  @Post('appraisal_requests')
  @Roles(ROLES.FACULTY)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateAppraisalDto, @CurrentUser() user: JwtPayload) {
    return this.appraisalService.create(dto, user.sub);
  }

  /** GET /api/v1/appraisal — Faculty (own only)/HoD/HR Payroll. Paginated, filterable. */
  @Get('appraisal_requests')
  @Roles(ROLES.FACULTY, ROLES.HOD, ROLES.HR_PAYROLL)
  findAll(
    @Query() query: ListAppraisalQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.appraisalService.findAll(query, user);
  }

  /** GET /api/v1/appraisal/:id — Faculty (own only)/HoD/HR Payroll. */
  @Get('appraisal_requests/:id')
  @Roles(ROLES.FACULTY, ROLES.HOD, ROLES.HR_PAYROLL)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.appraisalService.findOne(id, user);
  }

<<<<<<< HEAD
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppraisalDto: UpdateAppraisalDto,
  ) {
    return this.appraisalService.update(+id, updateAppraisalDto);
=======
  /** PATCH /api/v1/appraisal/:id — HoD (review) or HR Payroll (scoring/approval) only. */
  @Patch('appraisal_requests/:id')
  @Roles(ROLES.HOD, ROLES.HR_PAYROLL)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppraisalDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.appraisalService.update(id, dto, user);
>>>>>>> c43633224d18a4c76f422fa4859990192aed2664
  }

  /** DELETE /api/v1/appraisal/:id — Faculty only, own request, only while still 'submitted'. */
  @Delete('appraisal_requests/:id')
  @Roles(ROLES.FACULTY)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.appraisalService.remove(id, user.sub);
  }
}
