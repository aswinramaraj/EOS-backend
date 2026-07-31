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
import { GrnService } from './grn.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';

@Controller('grn')
@Roles(ROLES.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrnController {
  constructor(private readonly grnService: GrnService) {}

  /**
   * POST /api/v1/grn
   *
   * Error responses:
   *  400 VALIDATION_ERROR         – missing/invalid fields
   *  401 UNAUTHORIZED             – missing/invalid access token
   *  403 FORBIDDEN                – authenticated user is not an admin
   *  404 PURCHASE_ORDER_NOT_FOUND – purchase_order_id does not exist
   *  404 VENUE_NOT_FOUND          – issued_to_venue_id does not exist
   *  404 USER_NOT_FOUND           – recorded_by_user_id does not exist
   *  500 INTERNAL_ERROR           – unexpected server failure
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGrnDto) {
    return this.grnService.create(dto);
  }

  /**
   * GET /api/v1/grn
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get()
  findAll() {
    return this.grnService.findAll();
  }

  /**
   * GET /api/v1/grn/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  404 GRN_NOT_FOUND  – no GRN with the given id
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.grnService.findOne(id);
  }

  /**
   * PUT /api/v1/grn/:id
   *
   * Error responses:
   *  400 VALIDATION_ERROR         – invalid fields
   *  401 UNAUTHORIZED             – missing/invalid access token
   *  403 FORBIDDEN                – authenticated user is not an admin
   *  404 GRN_NOT_FOUND            – no GRN with the given id
   *  404 PURCHASE_ORDER_NOT_FOUND – purchase_order_id does not exist
   *  404 VENUE_NOT_FOUND          – issued_to_venue_id does not exist
   *  404 USER_NOT_FOUND           – recorded_by_user_id does not exist
   *  500 INTERNAL_ERROR           – unexpected server failure
   */
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGrnDto) {
    return this.grnService.update(id, dto);
  }

  /**
   * PATCH /api/v1/grn/:id
   *
   * Same behaviour as PUT — kept as a separate handler because NestJS route
   * metadata cannot be shared by stacking two HTTP-method decorators on one method.
   *
   * Error responses: see PUT /api/v1/grn/:id
   */
  @Patch(':id')
  patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGrnDto) {
    return this.grnService.update(id, dto);
  }

  /**
   * DELETE /api/v1/grn/:id
   *
   * Error responses:
   *  401 UNAUTHORIZED   – missing/invalid access token
   *  403 FORBIDDEN      – authenticated user is not an admin
   *  404 GRN_NOT_FOUND  – no GRN with the given id
   *  500 INTERNAL_ERROR – unexpected server failure
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.grnService.remove(id);
  }
}
