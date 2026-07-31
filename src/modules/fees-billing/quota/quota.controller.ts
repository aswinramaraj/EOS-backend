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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ROLES } from 'src/common/constants/roles.constant';
import { QuotaService } from './quota.service';
import { CreateQuotaDto } from './dto/create-quota.dto';
import { UpdateQuotaDto } from './dto/update-quota.dto';

@Controller('quotas')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  /**
   * POST /api/v1/quotas
   *
   * Error responses:
   *  400 VALIDATION_ERROR – missing/invalid name
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  409 QUOTA_EXISTS     – a quota with the same name already exists
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateQuotaDto) {
    return this.quotaService.create(dto);
  }

  /**
   * GET /api/v1/quotas
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.quotaService.findAll();
  }

  /**
   * GET /api/v1/quotas/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 QUOTA_NOT_FOUND  – no quota with the given id
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.quotaService.findOne(id);
  }

  /**
   * PUT /api/v1/quotas/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR – invalid name
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 QUOTA_NOT_FOUND  – no quota with the given id
   *  409 QUOTA_EXISTS     – another quota already uses this name
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Put(':id')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuotaDto) {
    return this.quotaService.update(id, dto);
  }

  /**
   * DELETE /api/v1/quotas/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED     – missing/invalid access token
   *  403 FORBIDDEN        – authenticated user is not an admin
   *  404 QUOTA_NOT_FOUND  – no quota with the given id
   *  409 QUOTA_IN_USE     – quota is referenced by fee_structures or students
   *  500 INTERNAL_ERROR   – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.quotaService.remove(id);
  }
}
